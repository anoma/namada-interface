import { fromBase64 } from "@cosmjs/encoding";
import { v4 as uuid } from "uuid";
import browser, { Windows } from "webextension-polyfill";

import { BuiltTx, TxType } from "@heliax/namada-sdk/web";
import { KVStore } from "@namada/storage";
import { SignArbitraryResponse, TxDetails } from "@namada/types";
import { paramsToUrl } from "@namada/utils";

import { ChainsService } from "background/chains";
import { KeyRingService } from "background/keyring";
import { SdkService } from "background/sdk";
import { VaultService } from "background/vault";
import { ExtensionBroadcaster } from "extension";
import { LocalStorage } from "storage";
import { EncodedTxData, PendingTx, WasmHashesStore } from "./types";

export class ApprovalsService {
  // holds promises which can be resolved with a message from a pop-up window
  protected resolverMap: Record<
    number,
    // TODO: there should be better typing for this
    // eslint-disable-next-line
    { resolve: (result?: any) => void; reject: (error?: any) => void }
  > = {};

  constructor(
    protected readonly txStore: KVStore<PendingTx>,
    protected readonly dataStore: KVStore<string>,
    protected readonly localStorage: LocalStorage,
    protected readonly wasmHashesStore: KVStore<WasmHashesStore>,
    protected readonly sdkService: SdkService,
    protected readonly keyRingService: KeyRingService,
    protected readonly vaultService: VaultService,
    protected readonly chainService: ChainsService,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {}

  async approveSignTx(
    txType: TxType,
    signer: string,
    tx: EncodedTxData,
    wrapperTxMsg: string
  ): Promise<Uint8Array> {
    const msgId = uuid();

    const details = await this.keyRingService.queryAccountDetails(signer);
    if (!details) {
      throw new Error(`Could not find account for ${signer}`);
    }

    const pendingTx = {
      txBytes: fromBase64(tx.txBytes),
      signingDataBytes: tx.signingDataBytes.map((bytes) => fromBase64(bytes)),
    };

    await this.txStore.set(msgId, {
      txType,
      tx: pendingTx,
      signer,
      wrapperTxMsg: fromBase64(wrapperTxMsg),
    });

    const url = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-sign-tx/${msgId}/${details.type}/${signer}`;

    const popupTabId = await this.getPopupTabId(url);

    if (!popupTabId) {
      throw new Error("no popup tab ID");
    }

    if (popupTabId in this.resolverMap) {
      throw new Error(`tab ID ${popupTabId} already exists in promise map`);
    }

    return await new Promise((resolve, reject) => {
      this.resolverMap[popupTabId] = { resolve, reject };
    });
  }

  async approveSignArbitrary(
    signer: string,
    data: string
  ): Promise<SignArbitraryResponse> {
    const msgId = uuid();

    await this.dataStore.set(msgId, data);
    const baseUrl = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-sign-arbitrary/${signer}`;

    const url = paramsToUrl(baseUrl, {
      msgId,
    });
    const popupTabId = await this.getPopupTabId(url);

    // TODO: can tabId be 0?
    if (!popupTabId) {
      throw new Error("no popup tab ID");
    }

    if (popupTabId in this.resolverMap) {
      throw new Error(`tab ID ${popupTabId} already exists in promise map`);
    }

    return await new Promise((resolve, reject) => {
      this.resolverMap[popupTabId] = { resolve, reject };
    });
  }

  async submitSignTx(
    popupTabId: number,
    msgId: string,
    signer: string
  ): Promise<void> {
    const pendingTx = (await this.txStore.get(msgId)) as PendingTx;
    const resolvers = this.resolverMap[popupTabId];

    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${popupTabId}`);
    }

    if (!pendingTx) {
      throw new Error(`Signing data for ${msgId} not found!`);
    }

    const builtTx = new BuiltTx(
      pendingTx.txType,
      pendingTx.tx.txBytes,
      // TODO: In shared, fix "into_serde" call to handle Uint8Array so the following
      // isn't needed:
      pendingTx.tx.signingDataBytes.map((bytes) => [...bytes]),
      pendingTx.wrapperTxMsg
    );

    try {
      const signature = await this.keyRingService.sign(builtTx, signer);
      resolvers.resolve(signature);
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
    const resolvers = this.resolverMap[popupTabId];

    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${popupTabId}`);
    }

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
    const resolvers = this.resolverMap[popupTabId];

    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${popupTabId}`);
    }

    await this._clearPendingSignature(msgId);
    resolvers.reject(new Error("Sign arbitrary rejected"));
  }

  // Remove pending transaction from storage
  async rejectSignTx(popupTabId: number, msgId: string): Promise<void> {
    const resolvers = this.resolverMap[popupTabId];
    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${popupTabId}`);
    }

    await this._clearPendingTx(msgId);
    resolvers.reject(new Error("Sign Tx rejected"));
  }

  async isConnectionApproved(interfaceOrigin: string): Promise<boolean> {
    const approvedOrigins =
      (await this.localStorage.getApprovedOrigins()) || [];

    return approvedOrigins.includes(interfaceOrigin);
  }

  async approveConnection(
    interfaceTabId: number,
    interfaceOrigin: string
  ): Promise<void> {
    const baseUrl = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-connection`;

    const url = paramsToUrl(baseUrl, {
      interfaceTabId: interfaceTabId.toString(),
      interfaceOrigin,
    });

    const alreadyApproved = await this.isConnectionApproved(interfaceOrigin);

    if (!alreadyApproved) {
      const popupTabId = await this.getPopupTabId(url);

      if (!popupTabId) {
        throw new Error("no popup tab ID");
      }

      if (popupTabId in this.resolverMap) {
        throw new Error(`tab ID ${popupTabId} already exists in promise map`);
      }

      return new Promise((resolve, reject) => {
        this.resolverMap[popupTabId] = { resolve, reject };
      });
    }

    // A resolved promise is implicitly returned here if the origin had
    // previously been approved.
  }

  async approveConnectionResponse(
    interfaceTabId: number,
    interfaceOrigin: string,
    allowConnection: boolean,
    popupTabId: number
  ): Promise<void> {
    const resolvers = this.resolverMap[popupTabId];
    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${interfaceTabId}`);
    }

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

  async revokeConnection(originToRevoke: string): Promise<void> {
    await this.localStorage.removeApprovedOrigin(originToRevoke);
    await this.broadcaster.revokeConnection();
  }

  async queryTxDetails(msgId: string): Promise<TxDetails> {
    const pendingTx = await this.txStore.get(msgId);

    if (!pendingTx) {
      throw new Error(`No transaction found for ${msgId}`);
    }

    const { chainId } = await this.chainService.getChain();
    const wasmHashes = await this.wasmHashesStore.get(chainId);

    const { tx } = this.sdkService.getSdk();
    return tx.deserialize(pendingTx.tx.txBytes, wasmHashes || []);
  }

  private async _clearPendingTx(msgId: string): Promise<void> {
    return await this.txStore.set(msgId, null);
  }

  private async _clearPendingSignature(msgId: string): Promise<void> {
    return await this.dataStore.set(msgId, null);
  }

  private _launchApprovalWindow = (url: string): Promise<Windows.Window> => {
    return browser.windows.create({
      url,
      width: 396,
      height: 510,
      type: "popup",
    });
  };

  private getPopupTabId = async (url: string): Promise<number | undefined> => {
    const window = await this._launchApprovalWindow(url);
    const firstTab = window.tabs?.[0];
    const popupTabId = firstTab?.id;

    return popupTabId;
  };
}
