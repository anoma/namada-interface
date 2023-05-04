import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { PhraseSize } from "@anoma/crypto";
import { KVStore } from "@anoma/storage";
import { AccountType, Bip44Path, DerivedAccount } from "@anoma/types";
import { Sdk } from "@anoma/shared";

import { KeyRing } from "./keyring";
import { KeyRingStatus, KeyStore, TabStore } from "./types";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { AccountChangedEventMsg } from "content/events";

export class KeyRingService {
  private _keyRing: KeyRing;

  constructor(
    protected readonly kvStore: KVStore<KeyStore[]>,
    protected readonly sdkStore: KVStore<string>,
    protected readonly accountAccountStore: KVStore<string>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly chainId: string,
    protected readonly sdk: Sdk,
    protected readonly cryptoMemory: WebAssembly.Memory,
    protected readonly requester: ExtensionRequester
  ) {
    this._keyRing = new KeyRing(
      kvStore,
      sdkStore,
      accountAccountStore,
      chainId,
      sdk,
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
      const tabs = (await this.connectedTabsStore.get(chainId)) || [];

      if (!tabs.find((tab) => tab.tabId === senderTabId)) {
        tabs.push({
          tabId: senderTabId,
          timestamp: Date.now(),
        });
        await this.connectedTabsStore.set(chainId, tabs);
      }
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    return await this._keyRing.checkPassword(password);
  }

  async generateMnemonic(size?: PhraseSize): Promise<string[]> {
    return await this._keyRing.generateMnemonic(size);
  }

  async saveMnemonic(
    words: string[],
    password: string,
    alias: string
  ): Promise<boolean> {
    return await this._keyRing.storeMnemonic(words, password, alias);
  }

  async deriveAccount(
    path: Bip44Path,
    type: AccountType,
    alias: string
  ): Promise<DerivedAccount> {
    return await this._keyRing.deriveAccount(path, type, alias);
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

  async submitTransfer(txMsg: string): Promise<void> {
    try {
      await this._keyRing.submitTransfer(fromBase64(txMsg));
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to encode transfer! ${e}`);
    }
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
    const tabs = await this.connectedTabsStore.get(this.chainId);
    await this._keyRing.setActiveAccountId(accountId);

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
  }

  async getActiveAccountId(): Promise<string | undefined> {
    return await this._keyRing.getActiveAccountId();
  }
}
