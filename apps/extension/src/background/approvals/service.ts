import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { v4 as uuid } from "uuid";
import browser, { Windows } from "webextension-polyfill";

import { KVStore } from "@namada/storage";
import {
  Message,
  SignArbitraryResponse,
  SigningDataMsgValue,
  TxDetails,
  TxProps,
} from "@namada/types";
import { paramsToUrl } from "@namada/utils";

import { ResponseSign } from "@zondax/ledger-namada";
import { TopLevelRoute } from "Approvals/types";
import { ChainService } from "background/chain";
import { KeyRingService } from "background/keyring";
import { SdkService } from "background/sdk";
import { VaultService } from "background/vault";
import { ExtensionBroadcaster } from "extension";
import { LocalStorage } from "storage";
import { fromEncodedTx } from "utils";
import { ApprovalErrors, EncodedTxData, PendingTx } from "./types";

type Resolver = {
  // TODO: there should be better typing for this
  // eslint-disable-next-line
  resolve: (result?: any) => void;
  reject: (error?: unknown) => void;
};

export class ApprovalsService {
  // holds promises which can be resolved with a message from a pop-up window
  protected resolverMap: Record<number, Resolver> = {};

  constructor(
    protected readonly txStore: KVStore<PendingTx>,
    protected readonly dataStore: KVStore<string>,
    protected readonly localStorage: LocalStorage,
    protected readonly sdkService: SdkService,
    protected readonly keyRingService: KeyRingService,
    protected readonly vaultService: VaultService,
    protected readonly chainService: ChainService,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {
    browser.tabs.onRemoved.addListener((tabId) => {
      let resolver: Resolver | undefined;
      try {
        resolver = this.getResolver(tabId);
      } catch {
        // do nothing if not found as it was resolved by the event handler
      }
      if (resolver) {
        resolver.reject(new Error("Window closed"));
        this.removeResolver(tabId);
      }
    });
  }

  async approveSignTx(
    signer: string,
    txs: EncodedTxData[],
    origin: string,
    checksums?: Record<string, string>
  ): Promise<Uint8Array[]> {
    if (await this.isLocked()) {
      throw new Error(ApprovalErrors.KeychainLocked());
    }
    const msgId = uuid();

    // If the signer is a disposable signer, get the real address
    const realAddress =
      (await this.localStorage.getDisposableSigner(signer))?.realAddress ||
      signer;

    // We use the real address to query the account details
    const details = await this.keyRingService.queryAccountDetails(realAddress);
    if (!details) {
      throw new Error(ApprovalErrors.AccountNotFound(signer));
    }

    const pendingTx: PendingTx = {
      signer,
      txs: txs.map((encodedTx) => fromEncodedTx(encodedTx)),
      checksums,
    };

    await this.txStore.set(msgId, pendingTx);

    return this.launchApprovalPopup(
      `${TopLevelRoute.ApproveSignTx}/${msgId}/${encodeURIComponent(origin)}/${details.type}/${signer}`
    );
  }

  async approveSignArbitrary(
    signer: string,
    data: string,
    origin: string
  ): Promise<SignArbitraryResponse> {
    if (await this.isLocked()) {
      throw new Error(ApprovalErrors.KeychainLocked());
    }
    const msgId = uuid();

    await this.dataStore.set(msgId, data);

    return this.launchApprovalPopup(
      `${TopLevelRoute.ApproveSignArbitrary}/${encodeURIComponent(origin)}/${signer}`,
      { msgId }
    );
  }

  async submitSignTx(
    popupTabId: number,
    msgId: string,
    signer: string
  ): Promise<void> {
    const pendingTx = (await this.txStore.get(msgId)) as PendingTx;
    const resolvers = this.getResolver(popupTabId);

    if (!pendingTx) {
      throw new Error(ApprovalErrors.PendingSigningDataNotFound(msgId));
    }

    try {
      const signedBytes: Uint8Array[] = [];
      for await (const tx of pendingTx.txs) {
        signedBytes.push(await this.keyRingService.sign(tx, signer));
      }
      resolvers.resolve(signedBytes);
    } catch (e) {
      resolvers.reject(e);
    }

    await this.clearPendingSignature(msgId);
  }

  async submitSignLedgerTx(
    popupTabId: number,
    msgId: string,
    responseSign: ResponseSign[]
  ): Promise<void> {
    const pendingTx = await this.txStore.get(msgId);
    const resolvers = this.getResolver(popupTabId);

    if (!pendingTx || !pendingTx.txs) {
      throw new Error(ApprovalErrors.TransactionDataNotFound(msgId));
    }

    if (pendingTx.txs.length !== responseSign.length) {
      throw new Error(ApprovalErrors.InvalidLedgerSignature(msgId));
    }

    const { tx } = this.sdkService.getSdk();

    try {
      const signedTxs = pendingTx.txs.map((pendingTx, i) => {
        return tx.appendSignature(pendingTx.bytes, responseSign[i]);
      });
      resolvers.resolve(signedTxs);
    } catch (e) {
      resolvers.reject(e);
    }

    await this.clearPendingSignature(msgId);
  }

  /**
   * Modifies pending transaction data by appending real MASP signatures
   *
   * @async
   * @param {string} msgId - message ID
   * @param {string} signer - signer
   * @throws {Error} - if pending transaction data is not found
   * @returns void
   */
  async signMasp(msgId: string, signer: string): Promise<void> {
    const pendingTx = await this.txStore.get(msgId);

    if (!pendingTx) {
      throw new Error(ApprovalErrors.PendingSigningDataNotFound(msgId));
    }

    const txs: TxProps[] = [];
    for await (const tx of pendingTx.txs) {
      const bytes = await this.keyRingService.signMasp(tx, signer);
      txs.push({
        ...tx,
        bytes,
      });
    }

    await this.txStore.set(msgId, { ...pendingTx, txs });
  }

  /**
   * Modifies pending transaction data by replacing MASP signatures
   *
   * @async
   * @param {string} msgId - message ID
   * @param {string[]} signatures - MASP signatures
   * @throws {Error} - if pending transaction data is not found
   * @returns void
   */
  async replaceMaspSignatures(
    msgId: string,
    signatures: string[]
  ): Promise<void> {
    const pendingTx = await this.txStore.get(msgId);
    if (!pendingTx) {
      throw new Error(ApprovalErrors.TransactionDataNotFound(msgId));
    }

    const { tx: sdkTx } = this.sdkService.getSdk();

    const txsWithSignatures = signatures.map((signature, i) => {
      const tx = pendingTx.txs[i];
      const signingData = tx.signingData.map((signingData) =>
        new Message().encode(new SigningDataMsgValue(signingData))
      );
      const txBytes = sdkTx.appendMaspSignature(
        tx.bytes,
        signingData,
        fromBase64(signature)
      );

      return { ...tx, bytes: txBytes };
    });

    await this.txStore.set(msgId, { ...pendingTx, txs: txsWithSignatures });
  }

  async submitSignArbitrary(
    popupTabId: number,
    msgId: string,
    signer: string
  ): Promise<void> {
    const data = await this.dataStore.get(msgId);
    const resolvers = this.getResolver(popupTabId);

    if (!data) {
      throw new Error(ApprovalErrors.PendingSigningDataNotFound(msgId));
    }

    try {
      const signature = await this.keyRingService.signArbitrary(signer, data);
      resolvers.resolve(signature);
    } catch (e) {
      resolvers.reject(e);
    }

    await this.clearPendingSignature(msgId);
  }

  async rejectSignArbitrary(popupTabId: number, msgId: string): Promise<void> {
    const resolvers = this.getResolver(popupTabId);

    await this.clearPendingSignature(msgId);
    resolvers.reject(new Error("Sign arbitrary rejected"));
  }

  // Remove pending transaction from storage
  async rejectSignTx(popupTabId: number, msgId: string): Promise<void> {
    const resolvers = this.getResolver(popupTabId);

    await this.clearPendingTx(msgId);
    resolvers.reject(new Error("Sign Tx rejected"));
  }

  async isSigningChainApproved(chainId: string): Promise<boolean> {
    const currentChainId = await this.chainService.getChain();
    if (chainId !== currentChainId) {
      return false;
    }
    return true;
  }

  async isDomainApproved(interfaceOrigin: string): Promise<boolean> {
    const approvedOrigins =
      (await this.localStorage.getApprovedOrigins()) || [];
    return approvedOrigins.includes(interfaceOrigin);
  }

  async isConnectionApproved(
    interfaceOrigin: string,
    chainId?: string
  ): Promise<boolean> {
    if (await this.isLocked()) {
      return false;
    }

    if (chainId) {
      const isChainApproved = await this.isSigningChainApproved(chainId);
      if (!isChainApproved) return false;
    }

    return this.isDomainApproved(interfaceOrigin);
  }

  async approveConnection(
    interfaceOrigin: string,
    chainId?: string
  ): Promise<void> {
    const isLocked = await this.isLocked();
    const needsApproval = !(await this.isConnectionApproved(
      interfaceOrigin,
      chainId
    ));

    const approveConnectionPopupProps: {
      interfaceOrigin: string;
      chainId?: string;
    } = {
      interfaceOrigin,
    };

    if (chainId) {
      approveConnectionPopupProps["chainId"] = chainId;
    }

    if (needsApproval || isLocked) {
      return this.launchApprovalPopup(
        TopLevelRoute.ApproveConnection,
        approveConnectionPopupProps
      );
    }

    // A resolved promise is implicitly returned here if launching
    // popup is not needed
  }

  async approveConnectionResponse(
    popupTabId: number,
    interfaceOrigin: string,
    allowConnection: boolean,
    chainId?: string
  ): Promise<void> {
    const resolvers = this.getResolver(popupTabId);

    if (allowConnection) {
      try {
        if (
          !(await this.localStorage.getApprovedOrigins())?.includes(
            interfaceOrigin
          )
        ) {
          // Add approved origin if it hasn't been added
          await this.localStorage.addApprovedOrigin(interfaceOrigin);
        }

        if (chainId) {
          // Set approved signing chainId
          await this.chainService.updateChain(chainId);
        }
      } catch (e) {
        resolvers.reject(e);
      }
      resolvers.resolve();
    } else {
      resolvers.reject();
    }
  }

  async approveDisconnection(
    interfaceOrigin: string,
    chainId?: string
  ): Promise<void> {
    const isConnected = await this.isConnectionApproved(
      interfaceOrigin,
      chainId
    );

    if (isConnected) {
      return this.launchApprovalPopup(TopLevelRoute.ApproveDisconnection, {
        interfaceOrigin,
      });
    }

    // A resolved promise is implicitly returned here if the origin had
    // previously been disconnected.
  }

  async approveDisconnectionResponse(
    popupTabId: number,
    interfaceOrigin: string,
    revokeConnection: boolean
  ): Promise<void> {
    const resolvers = this.getResolver(popupTabId);

    if (revokeConnection) {
      try {
        await this.revokeConnection(interfaceOrigin);
      } catch (e) {
        resolvers.reject(e);
      }
      resolvers.resolve();
    } else {
      resolvers.reject();
    }
  }

  async revokeConnection(originToRevoke: string): Promise<void> {
    await this.localStorage.removeApprovedOrigin(originToRevoke);
    await this.broadcaster.revokeConnection();
  }

  async approveUpdateDefaultAccount(address: string): Promise<void> {
    const account = await this.keyRingService.queryAccountDetails(address);

    return this.launchApprovalPopup(TopLevelRoute.ApproveUpdateDefaultAccount, {
      address,
      alias: account?.alias ?? "",
    });
  }

  async submitUpdateDefaultAccount(
    popupTabId: number,
    address: string
  ): Promise<void> {
    const resolvers = this.getResolver(popupTabId);

    try {
      await this.keyRingService.updateDefaultAccount(address);
    } catch (e) {
      resolvers.reject(e);
    }
    resolvers.resolve();
  }

  async queryTxDetails(msgId: string): Promise<TxDetails[]> {
    const pendingTx = await this.txStore.get(msgId);

    if (!pendingTx) {
      throw new Error(ApprovalErrors.TransactionDataNotFound(msgId));
    }

    const { tx } = this.sdkService.getSdk();
    return pendingTx.txs.map(({ bytes }) =>
      tx.deserialize(bytes, pendingTx.checksums || {})
    );
  }

  async queryPendingTxBytes(msgId: string): Promise<string[] | undefined> {
    const pendingTx = await this.txStore.get(msgId);

    if (!pendingTx) {
      throw new Error(ApprovalErrors.TransactionDataNotFound(msgId));
    }

    if (pendingTx.txs) {
      return pendingTx.txs.map(({ bytes }) => toBase64(bytes));
    }
  }

  async querySignArbitraryDetails(msgId: string): Promise<string> {
    const pendingSignArbitrary = await this.dataStore.get(msgId);

    if (!pendingSignArbitrary) {
      throw new Error(ApprovalErrors.PendingSignArbitaryDataNotFound(msgId));
    }

    return pendingSignArbitrary;
  }

  private async clearPendingTx(msgId: string): Promise<void> {
    return await this.txStore.set(msgId, null);
  }

  private async clearPendingSignature(msgId: string): Promise<void> {
    return await this.dataStore.set(msgId, null);
  }

  private createPopup = (url: string): Promise<Windows.Window> => {
    return browser.windows.create({
      url,
      width: 396,
      height: 640,
      type: "popup",
    });
  };

  private getPopupTabId = (window: browser.Windows.Window): number => {
    const firstTab = window.tabs?.[0];
    const popupTabId = firstTab?.id;

    if (!popupTabId) {
      throw new Error("no popup tab ID");
    }

    if (popupTabId in this.resolverMap) {
      throw new Error(`tab ID ${popupTabId} already exists in promise map`);
    }

    return popupTabId;
  };

  private launchApprovalPopup = async <T>(
    route: string,
    params?: Record<string, string>
  ): Promise<T> => {
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#${route}`;
    const url = params ? paramsToUrl(baseUrl, params) : baseUrl;

    const window = await this.createPopup(url);
    const popupTabId = this.getPopupTabId(window);

    return new Promise<T>((resolve, reject) => {
      this.resolverMap[popupTabId] = {
        resolve: (args: T) => {
          this.removeResolver(popupTabId);
          return resolve(args);
        },
        reject: (args: unknown) => {
          this.removeResolver(popupTabId);
          return reject(args);
        },
      };
    });
  };

  private getResolver = (popupTabId: number): Resolver => {
    const resolvers = this.resolverMap[popupTabId];
    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${popupTabId}`);
    }
    return resolvers;
  };

  private removeResolver = (popupTabId: number): void => {
    delete this.resolverMap[popupTabId];
  };

  private isLocked = async (): Promise<boolean> => {
    return await this.vaultService.isLocked();
  };
}
