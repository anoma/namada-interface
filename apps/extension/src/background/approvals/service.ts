import { toBase64 } from "@cosmjs/encoding";
import { v4 as uuid } from "uuid";
import browser, { Windows } from "webextension-polyfill";

import { KVStore } from "@namada/storage";
import { SignArbitraryResponse, TxDetails } from "@namada/types";
import { paramsToUrl } from "@namada/utils";

import { ResponseSign } from "@zondax/ledger-namada";
import { TopLevelRoute } from "Approvals/types";
import { ChainsService } from "background/chains";
import { KeyRingService } from "background/keyring";
import { SdkService } from "background/sdk";
import { VaultService } from "background/vault";
import { ExtensionBroadcaster } from "extension";
import { LocalStorage } from "storage";
import { fromEncodedTx } from "utils";
import { EncodedTxData, PendingTx } from "./types";

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
    protected readonly chainService: ChainsService,
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
    checksums?: Record<string, string>
  ): Promise<Uint8Array[]> {
    const msgId = uuid();

    const details = await this.keyRingService.queryAccountDetails(signer);
    if (!details) {
      throw new Error(`Could not find account for ${signer}`);
    }

    const pendingTx: PendingTx = {
      signer,
      txs: txs.map((encodedTx) => fromEncodedTx(encodedTx)),
      checksums,
    };

    await this.txStore.set(msgId, pendingTx);

    return this.launchApprovalPopup(
      `${TopLevelRoute.ApproveSignTx}/${msgId}/${details.type}/${signer}`
    );
  }

  async approveSignArbitrary(
    signer: string,
    data: string
  ): Promise<SignArbitraryResponse> {
    const msgId = uuid();

    await this.dataStore.set(msgId, data);

    return this.launchApprovalPopup(
      `${TopLevelRoute.ApproveSignArbitrary}/${signer}`,
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
      throw new Error(`Signing data for ${msgId} not found!`);
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

    await this._clearPendingSignature(msgId);
  }

  async submitSignLedgerTx(
    popupTabId: number,
    msgId: string,
    responseSign: ResponseSign[]
  ): Promise<void> {
    const pendingTx = await this.txStore.get(msgId);
    const resolvers = this.getResolver(popupTabId);

    if (!pendingTx || !pendingTx.txs) {
      throw new Error(`Transaction data for ${msgId} not found!`);
    }

    if (pendingTx.txs.length !== responseSign.length) {
      throw new Error(`Did not receive correct signatures for tx ${msgId}`);
    }

    const { tx } = this.sdkService.getSdk();

    try {
      const signedTxs = pendingTx.txs.map(({ bytes }, i) => {
        return tx.appendSignature(bytes, responseSign[i]);
      });
      resolvers.resolve(signedTxs);
    } catch (e) {
      resolvers.reject(e);
    }

    await this._clearPendingSignature(msgId);
  }

  async submitSignArbitrary(
    popupTabId: number,
    msgId: string,
    signer: string
  ): Promise<void> {
    const data = await this.dataStore.get(msgId);
    const resolvers = this.getResolver(popupTabId);

    if (!data) {
      throw new Error(`Signing data for ${msgId} not found!`);
    }
    //TODO: Shouldn't we _clearPendingSignature when throwing?

    try {
      const signature = await this.keyRingService.signArbitrary(signer, data);
      resolvers.resolve(signature);
    } catch (e) {
      resolvers.reject(e);
    }

    await this._clearPendingSignature(msgId);
  }

  async rejectSignArbitrary(popupTabId: number, msgId: string): Promise<void> {
    const resolvers = this.getResolver(popupTabId);

    await this._clearPendingSignature(msgId);
    resolvers.reject(new Error("Sign arbitrary rejected"));
  }

  // Remove pending transaction from storage
  async rejectSignTx(popupTabId: number, msgId: string): Promise<void> {
    const resolvers = this.getResolver(popupTabId);

    await this._clearPendingTx(msgId);
    resolvers.reject(new Error("Sign Tx rejected"));
  }

  async isConnectionApproved(
    interfaceOrigin: string,
    chainId: string
  ): Promise<boolean> {
    const approvedOrigins =
      (await this.localStorage.getApprovedOrigins()) || [];

    const chain = await this.chainService.getChain();
    if (chain.chainId !== chainId) {
      return false;
    }

    return approvedOrigins.includes(interfaceOrigin);
  }

  async approveConnection(
    interfaceOrigin: string,
    chainId: string
  ): Promise<void> {
    const alreadyApproved = await this.isConnectionApproved(
      interfaceOrigin,
      chainId
    );

    if (!alreadyApproved) {
      return this.launchApprovalPopup(TopLevelRoute.ApproveConnection, {
        interfaceOrigin,
        chainId,
      });
    }

    // A resolved promise is implicitly returned here if the origin had
    // previously been approved.
  }

  async approveConnectionResponse(
    popupTabId: number,
    interfaceOrigin: string,
    allowConnection: boolean
  ): Promise<void> {
    const resolvers = this.getResolver(popupTabId);

    if (allowConnection) {
      try {
        await this.localStorage.addApprovedOrigin(interfaceOrigin);
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
    chainId: string
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
      throw new Error(`No transaction found for ${msgId}`);
    }

    const { tx } = this.sdkService.getSdk();
    return pendingTx.txs.map(({ bytes }) =>
      tx.deserialize(bytes, pendingTx.checksums || {})
    );
  }

  async queryPendingTxBytes(msgId: string): Promise<string[] | undefined> {
    const pendingTx = await this.txStore.get(msgId);

    if (!pendingTx) {
      throw new Error(`Tx not found for ${msgId}`);
    }

    if (pendingTx.txs) {
      return pendingTx.txs.map(({ bytes }) => toBase64(bytes));
    }
  }

  async querySignArbitraryDetails(msgId: string): Promise<string> {
    const pendingSignArbitrary = await this.dataStore.get(msgId);

    if (!pendingSignArbitrary) {
      throw new Error(`No pending sign-arbitrary data found for ${msgId}`);
    }

    return pendingSignArbitrary;
  }

  private async _clearPendingTx(msgId: string): Promise<void> {
    return await this.txStore.set(msgId, null);
  }

  private async _clearPendingSignature(msgId: string): Promise<void> {
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
}
