import { v4 as uuid } from "uuid";
import browser, { Windows } from "webextension-polyfill";

import { SupportedTx } from "@heliax/namada-sdk/web";
import { KVStore } from "@namada/storage";
import { AccountType, SignArbitraryResponse } from "@namada/types";

import { paramsToUrl } from "@namada/utils";
import { KeyRingService } from "background/keyring";

import { BuiltTx } from "@namada/shared";
import { VaultService } from "background/vault";
import { ExtensionBroadcaster } from "extension";
import { LocalStorage } from "storage";

export class ApprovalsService {
  // holds promises which can be resolved with a message from a pop-up window
  protected resolverMap: Record<
    number,
    // TODO: there should be better typing for this
    // eslint-disable-next-line
    { resolve: (result?: any) => void; reject: (error?: any) => void }
  > = {};

  constructor(
    protected readonly txStore: KVStore<BuiltTx>,
    protected readonly dataStore: KVStore<string>,
    protected readonly localStorage: LocalStorage,
    protected readonly keyRingService: KeyRingService,
    protected readonly vaultService: VaultService,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {}

  async approveSignature(
    signer: string,
    data: string
  ): Promise<SignArbitraryResponse> {
    const msgId = uuid();

    await this.dataStore.set(msgId, data);
    const baseUrl = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-signature/${signer}`;

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

  async submitApprovedTx(
    popupTabId: number,
    msgId: string,
    signer: string
  ): Promise<void> {
    const tx = await this.txStore.get(msgId);
    const resolvers = this.resolverMap[popupTabId];

    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${popupTabId}`);
    }

    if (!tx) {
      throw new Error(`Signing data for ${msgId} not found!`);
    }

    try {
      const signature = await this.keyRingService.sign(signer, tx);
      resolvers.resolve(signature);
    } catch (e) {
      resolvers.reject(e);
    }

    await this._clearPendingSignature(msgId);
  }

  async submitSignature(
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

  async rejectSignature(popupTabId: number, msgId: string): Promise<void> {
    const resolvers = this.resolverMap[popupTabId];

    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${popupTabId}`);
    }

    await this._clearPendingSignature(msgId);
    resolvers.reject();
  }

  async approveTx(
    txType: SupportedTx,
    tx: BuiltTx,
    type: AccountType
  ): Promise<void> {
    const msgId = uuid();
    await this.txStore.set(msgId, tx);

    const url = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-tx/${msgId}/${txType}/${type}`;

    await this._launchApprovalWindow(url);
  }

  // Remove pending transaction from storage
  async rejectTx(msgId: string): Promise<void> {
    await this._clearPendingTx(msgId);
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
