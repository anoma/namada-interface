import { fromBase64, toBase64 } from "@cosmjs/encoding";

import { PhraseSize } from "@anoma/crypto";
import { KVStore } from "@anoma/storage";
import { AccountType, Bip44Path, DerivedAccount } from "@anoma/types";
import { Query, Sdk } from "@anoma/shared";
import { Result } from "@anoma/utils";

import { KeyRing } from "./keyring";
import {
  KeyRingStatus,
  KeyStore,
  TabStore,
  ResetPasswordError,
  DeleteAccountError,
} from "./types";
import { syncTabs, updateTabStorage } from "./utils";
import { ExtensionRequester, getAnomaRouterId } from "extension";
import { Ports } from "router";
import {
  AccountChangedEventMsg,
  TransferCompletedEvent,
  TransferStartedEvent,
  UpdatedBalancesEventMsg,
} from "content/events";
import {
  createOffscreenWithTxWorker,
  hasOffscreenDocument,
  OFFSCREEN_TARGET,
  SUBMIT_TRANSFER_MSG_TYPE,
} from "background/offscreen";
import { init as initSubmitTransferWebWorker } from "background/web-workers";

export class KeyRingService {
  private _keyRing: KeyRing;

  constructor(
    protected readonly kvStore: KVStore<KeyStore[]>,
    protected readonly sdkStore: KVStore<Record<string, string>>,
    protected readonly accountAccountStore: KVStore<string>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly extensionStore: KVStore<number>,
    protected readonly chainId: string,
    protected readonly sdk: Sdk,
    protected readonly query: Query,
    protected readonly cryptoMemory: WebAssembly.Memory,
    protected readonly requester: ExtensionRequester
  ) {
    this._keyRing = new KeyRing(
      kvStore,
      sdkStore,
      accountAccountStore,
      extensionStore,
      chainId,
      sdk,
      query,
      cryptoMemory
    );
  }

  lock(): { status: KeyRingStatus } {
    this._keyRing.lock();
    return { status: this._keyRing.status };
  }

  async unlock(password: string): Promise<{ status: KeyRingStatus }> {
    if (!password) {
      throw new Error("A password is required to unlock keystore!");
    }
    await this._keyRing.unlock(password);
    return { status: this._keyRing.status };
  }

  isLocked(): boolean {
    return this._keyRing.isLocked();
  }

  // Track connected tabs by ID
  async connect(senderTabId: number, chainId: string): Promise<void> {
    // Validate chainId, if valid, append tab unless it already exists
    if (chainId === this.chainId) {
      const tabs = await syncTabs(
        this.connectedTabsStore,
        this.requester,
        this.chainId
      );

      return await updateTabStorage(
        senderTabId,
        tabs,
        this.connectedTabsStore,
        this.chainId
      );
    }
    throw new Error("Connect: Invalid chainId");
  }

  async checkPassword(password: string): Promise<boolean> {
    return await this._keyRing.checkPassword(password);
  }

  async resetPassword(
    currentPassword: string,
    newPassword: string,
    accountId: string
  ): Promise<Result<null, ResetPasswordError>> {
    return await this._keyRing.resetPassword(
      currentPassword,
      newPassword,
      accountId
    );
  }

  async generateMnemonic(size?: PhraseSize): Promise<string[]> {
    return await this._keyRing.generateMnemonic(size);
  }

  validateMnemonic(phrase: string): boolean {
    return this._keyRing.validateMnemonic(phrase);
  }

  async saveMnemonic(
    words: string[],
    password: string,
    alias: string
  ): Promise<boolean> {
    const results = await this._keyRing.storeMnemonic(words, password, alias);
    await this.broadcastAccountsChanged();
    return results;
  }

  async deriveAccount(
    path: Bip44Path,
    type: AccountType,
    alias: string
  ): Promise<DerivedAccount> {
    const account = await this._keyRing.deriveAccount(path, type, alias);
    await this.broadcastAccountsChanged();
    return account;
  }

  async queryAccounts(): Promise<DerivedAccount[]> {
    return await this._keyRing.queryAccounts();
  }

  async queryParentAccounts(): Promise<DerivedAccount[]> {
    return await this._keyRing.queryParentAccounts();
  }

  async submitBond(txMsg: string): Promise<void> {
    try {
      await this._keyRing.submitBond(fromBase64(txMsg));
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to submit bond tx! ${e}`);
    }
  }

  async submitUnbond(txMsg: string): Promise<void> {
    try {
      await this._keyRing.submitUnbond(fromBase64(txMsg));
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to submit unbond tx! ${e}`);
    }
  }

  private async submitTransferChrome(
    txMsg: string,
    msgId: string,
    password: string,
    xsk?: string
  ): Promise<void> {
    const offscreenDocumentPath = "offscreen.html";
    const routerId = await getAnomaRouterId(this.extensionStore);

    if (!(await hasOffscreenDocument(offscreenDocumentPath))) {
      await createOffscreenWithTxWorker(offscreenDocumentPath);
    }

    await chrome.runtime.sendMessage({
      type: SUBMIT_TRANSFER_MSG_TYPE,
      target: OFFSCREEN_TARGET,
      routerId,
      data: { txMsg, msgId, password, xsk },
    });
  }

  private async submitTransferFirefox(
    txMsg: string,
    msgId: string,
    password: string,
    xsk?: string
  ): Promise<void> {
    initSubmitTransferWebWorker(
      {
        txMsg,
        msgId,
        password,
        xsk,
      },
      this.handleTransferCompleted.bind(this)
    );
  }

  /**
   * Submits a transfer transaction to the chain.
   * Handles both Shielded and Transparent transfers.
   *
   * @async
   * @param {string} txMsg - borsh serialized transfer transaction
   * @param {string} msgId - id of a tx if originating from approval process
   * @throws {Error} - if unable to submit transfer
   * @returns {Promise<void>} - resolves when transfer is successfull (resolves for failed VPs)
   */
  async submitTransfer(txMsg: string, msgId: string): Promise<void> {
    // Passing submit handler simplifies worker code when using Firefox
    const submit = async (password: string, xsk?: string): Promise<void> => {
      const { TARGET } = process.env;
      if (TARGET === "chrome") {
        this.submitTransferChrome(txMsg, msgId, password, xsk);
      } else if (TARGET === "firefox") {
        this.submitTransferFirefox(txMsg, msgId, password, xsk);
      } else {
        console.warn(
          "Submitting transfers is not supported with your browser."
        );
      }
    };

    const tabs = await syncTabs(
      this.connectedTabsStore,
      this.requester,
      this.chainId
    );

    try {
      tabs.forEach(({ tabId }: TabStore) => {
        this.requester.sendMessageToTab(
          tabId,
          Ports.WebBrowser,
          new TransferStartedEvent(msgId)
        );
      });
    } catch (e) {
      console.warn(e);
    }

    try {
      await this._keyRing.submitTransfer(fromBase64(txMsg), submit.bind(this));
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to submit the transfer! ${e}`);
    }
    return await this.broadcastUpdateBalance();
  }

  async submitIbcTransfer(txMsg: string): Promise<void> {
    try {
      await this._keyRing.submitIbcTransfer(fromBase64(txMsg));
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to encode transfer! ${e}`);
    }
  }

  /**
   * Creating an InitAccount for Namada requires a secret,
   * therefore, we need to query the private key for this account from
   * storage
   */
  async encodeInitAccount(txMsg: string, address: string): Promise<string> {
    const tx_data = await this._keyRing.encodeInitAccount(
      address,
      fromBase64(txMsg)
    );
    return toBase64(tx_data);
  }

  async setActiveAccountId(accountId: string): Promise<void> {
    await this._keyRing.setActiveAccountId(accountId);

    await this.broadcastAccountsChanged();
  }

  async getActiveAccountId(): Promise<string | undefined> {
    return await this._keyRing.getActiveAccountId();
  }

  async handleTransferCompleted(
    msgId: string,
    success: boolean
  ): Promise<void> {
    const tabs = await syncTabs(
      this.connectedTabsStore,
      this.requester,
      this.chainId
    );

    try {
      tabs.forEach(({ tabId }: TabStore) => {
        this.requester.sendMessageToTab(
          tabId,
          Ports.WebBrowser,
          new TransferCompletedEvent(msgId, success)
        );
      });
      this.broadcastUpdateBalance();
    } catch (e) {
      console.warn(e);
    }
  }

  closeOffscreenDocument(): Promise<void> {
    if (chrome) {
      return chrome.offscreen.closeDocument();
    } else {
      return Promise.reject(
        "Trying to close offscreen document for nor supported browser"
      );
    }
  }

  async deleteAccount(
    accountId: string,
    password: string
  ): Promise<Result<null, DeleteAccountError>> {
    return await this._keyRing.deleteAccount(accountId, password);
  }

  private async broadcastAccountsChanged(): Promise<void> {
    const tabs = await syncTabs(
      this.connectedTabsStore,
      this.requester,
      this.chainId
    );
    try {
      tabs?.forEach(({ tabId }: TabStore) => {
        this.requester.sendMessageToTab(
          tabId,
          Ports.WebBrowser,
          new AccountChangedEventMsg(this.chainId)
        );
      });
    } catch (e) {
      console.warn(e);
    }

    return;
  }

  async fetchAndStoreMaspParams(): Promise<void> {
    await Sdk.fetch_and_store_masp_params();
  }

  async hasMaspParams(): Promise<boolean> {
    return Sdk.has_masp_params();
  }

  private async broadcastUpdateBalance(): Promise<void> {
    const tabs = await syncTabs(
      this.connectedTabsStore,
      this.requester,
      this.chainId
    );
    try {
      tabs?.forEach(({ tabId }: TabStore) => {
        this.requester.sendMessageToTab(
          tabId,
          Ports.WebBrowser,
          new UpdatedBalancesEventMsg(this.chainId)
        );
      });
    } catch (e) {
      console.warn(e);
    }

    return;
  }

  async queryBalances(
    owner: string
  ): Promise<{ token: string; amount: number }[]> {
    return this._keyRing.queryBalances(owner);
  }
}
