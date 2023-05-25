import { v5 as uuid } from "uuid";

import {
  HDWallet,
  Mnemonic,
  PhraseSize,
  ShieldedHDWallet,
  VecU8Pointer,
} from "@anoma/crypto";
import {
  Account,
  Address,
  ExtendedSpendingKey,
  ExtendedViewingKey,
  PaymentAddress,
  Sdk,
} from "@anoma/shared";
import { IStore, KVStore, Store } from "@anoma/storage";
import { AccountType, Bip44Path, DerivedAccount } from "@anoma/types";
import { chains } from "@anoma/chains";
import { Crypto } from "./crypto";
import { KeyRingStatus, KeyStore } from "./types";
import {
  readVecStringPointer,
  readStringPointer,
} from "@anoma/crypto/src/utils";
import { toBase64 } from "@cosmjs/encoding";
import {
  createOffscreenWithTxWorker,
  hasOffscreenDocument,
  OFFSCREEN_TARGET,
  SUBMIT_TRANSFER_MSG_TYPE,
} from "../offscreen";
import { init as initSubmitTransferWebWorker } from "background/web-workers";
import { getAnomaRouterId } from "extension";

// Generated UUID namespace for uuid v5
const UUID_NAMESPACE = "9bfceade-37fe-11ed-acc0-a3da3461b38c";

// Construct unique uuid, passing in an arbitray number of arguments.
// This could be a unique parameter of the object receiving the id,
// or an index based on the number of existing objects in a hierarchy.
const getId = (name: string, ...args: (number | string)[]): string => {
  // Ensure a unique UUID
  let uuidName = name;

  // Concatenate any number of args onto the name parameter
  args.forEach((arg) => {
    uuidName = `${uuidName}::${arg}`;
  });

  return uuid(uuidName, UUID_NAMESPACE);
};

export const KEYSTORE_KEY = "key-store";
export const SDK_KEY = "sdk-store";
export const PARENT_ACCOUNT_ID_KEY = "parent-account-id";

const crypto = new Crypto();

type DerivedAccountInfo = {
  address: string;
  id: string;
  text: string;
};

type DerivedShieldedAccountInfo = {
  address: string;
  id: string;
  spendingKey: Uint8Array;
  text: string;
};

/**
 * Keyring stores keys in persisted backround.
 */
export class KeyRing {
  private _keyStore: IStore<KeyStore>;
  private _password: string | undefined;
  private _status: KeyRingStatus = KeyRingStatus.Empty;
  private _cryptoMemory: WebAssembly.Memory;

  constructor(
    protected readonly kvStore: KVStore<KeyStore[]>,
    protected readonly sdkStore: KVStore<string>,
    protected readonly activeAccountStore: KVStore<string>,
    protected readonly extensionStore: KVStore<number>,
    protected readonly chainId: string,
    protected readonly sdk: Sdk,
    protected readonly cryptoMemory: WebAssembly.Memory
  ) {
    this._keyStore = new Store(KEYSTORE_KEY, kvStore);
    this._cryptoMemory = cryptoMemory;
  }

  public isLocked(): boolean {
    return this._password === undefined;
  }

  public get status(): KeyRingStatus {
    return this._status;
  }

  public async lock(): Promise<void> {
    this._status = KeyRingStatus.Locked;
    this._password = undefined;
  }

  public async unlock(password: string): Promise<void> {
    if (await this.checkPassword(password)) {
      this._password = password;
      this._status = KeyRingStatus.Unlocked;
    }
  }

  public async getActiveAccountId(): Promise<string | undefined> {
    return await this.activeAccountStore.get(PARENT_ACCOUNT_ID_KEY);
  }

  public async setActiveAccountId(parentId: string): Promise<void> {
    await this.activeAccountStore.set(PARENT_ACCOUNT_ID_KEY, parentId);
  }

  public async checkPassword(password: string): Promise<boolean> {
    const activeAccountId = await this.getActiveAccountId();

    const mnemonic = await this._keyStore.getRecord("id", activeAccountId);
    // TODO: Generate arbitray data to check decryption against
    if (mnemonic) {
      try {
        crypto.decrypt(mnemonic, password, this._cryptoMemory);
        return true;
      } catch (error) {
        console.warn(error);
      }
    }

    return false;
  }

  // Return new mnemonic to client for validation
  public async generateMnemonic(
    size: PhraseSize = PhraseSize.N12
  ): Promise<string[]> {
    const mnemonic = new Mnemonic(size);
    const vecStringPointer = mnemonic.to_words();
    const words = readVecStringPointer(vecStringPointer, this._cryptoMemory);

    mnemonic.free();
    vecStringPointer.free();

    return words;
  }

  // Store validated mnemonic
  public async storeMnemonic(
    mnemonic: string[],
    password: string,
    alias: string
  ): Promise<boolean> {
    if (!password) {
      throw new Error("Password is not provided! Cannot store mnemonic");
    }
    const phrase = mnemonic.join(" ");

    try {
      const mnemonic = Mnemonic.from_phrase(phrase);
      const seed = mnemonic.to_seed();
      const { coinType } = chains[this.chainId].bip44;
      const path = `m/44'/${coinType}'/0'/0`;
      const bip44 = new HDWallet(seed);
      const account = bip44.derive(path);
      const stringPointer = account.private().to_hex();
      const sk = readStringPointer(stringPointer, this._cryptoMemory);
      const address = new Address(sk).implicit();
      const { chainId } = this;

      // Generate unique ID for new parent account:
      const id = getId(phrase, (await this._keyStore.get()).length);

      mnemonic.free();
      bip44.free();
      account.free();
      stringPointer.free();

      const mnemonicStore = crypto.encrypt({
        id,
        alias,
        address,
        chainId,
        password,
        path: {
          account: 0,
          change: 0,
        },
        text: phrase,
        type: AccountType.Mnemonic,
      });

      await this._keyStore.append(mnemonicStore);
      await this.addSecretKey(sk, password, alias);
      await this.setActiveAccountId(id);

      this._password = password;
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  public static deriveTransparentAccount(
    seed: VecU8Pointer,
    path: Bip44Path,
    parentId: string,
    chainId: string,
    cryptoMemory: WebAssembly.Memory
  ): DerivedAccountInfo {
    const { account, change, index = 0 } = path;
    const root = "m/44'";
    const { coinType } = chains[chainId].bip44;
    const derivationPath = [
      root,
      `${coinType}'`,
      `${account}`,
      change,
      index,
    ].join("/");
    const bip44 = new HDWallet(seed);
    const derivedAccount = bip44.derive(derivationPath);

    const privateKey = derivedAccount.private();
    const hex = privateKey.to_hex();
    const text = readStringPointer(hex, cryptoMemory);
    const address = new Address(text).implicit();
    const id = getId("account", parentId, account, change, index);

    bip44.free();
    derivedAccount.free();
    privateKey.free();
    hex.free();

    return {
      address,
      id,
      text,
    };
  }

  public static deriveShieldedAccount(
    seed: VecU8Pointer,
    path: Bip44Path,
    parentId: string
  ): DerivedShieldedAccountInfo {
    const { index = 0 } = path;
    const id = getId("shielded-account", parentId, index);
    const zip32 = new ShieldedHDWallet(seed);
    const account = zip32.derive_to_serialized_keys(index);

    // Retrieve serialized types from wasm
    const xsk = account.xsk();
    const xfvk = account.xfvk();
    const payment_address = account.payment_address();

    // Deserialize and encode keys and address
    const spendingKey = new ExtendedSpendingKey(xsk).encode();
    const extendedViewingKey = new ExtendedViewingKey(xfvk);
    const viewingKey = extendedViewingKey.encode();
    const address = new PaymentAddress(payment_address).encode();

    zip32.free();
    account.free();
    extendedViewingKey.free();

    return {
      address,
      id,
      spendingKey: xsk,
      text: JSON.stringify({ spendingKey, viewingKey }),
    };
  }

  public async deriveAccount(
    path: Bip44Path,
    type: AccountType,
    alias: string
  ): Promise<DerivedAccount> {
    if (!this._password) {
      throw new Error("No password is set!");
    }

    const storedMnemonic = await this._keyStore.getRecord(
      "id",
      await this.getActiveAccountId()
    );

    if (!storedMnemonic) {
      throw new Error("Mnemonic is not set!");
    }

    const parentId = storedMnemonic.id;

    try {
      const phrase = crypto.decrypt(
        storedMnemonic,
        this._password,
        this._cryptoMemory
      );
      const mnemonic = Mnemonic.from_phrase(phrase);
      const seed = mnemonic.to_seed();
      mnemonic.free();

      let id: string;
      let address: string;
      let text: string;

      if (type === AccountType.ShieldedKeys) {
        const { spendingKey, ...shieldedAccount } =
          KeyRing.deriveShieldedAccount(seed, path, parentId);
        id = shieldedAccount.id;
        address = shieldedAccount.address;
        text = shieldedAccount.text;

        this.addSpendingKey(spendingKey, this._password, alias);
      } else {
        const transparentAccount = KeyRing.deriveTransparentAccount(
          seed,
          path,
          parentId,
          this.chainId,
          this._cryptoMemory
        );
        id = transparentAccount.id;
        address = transparentAccount.address;
        text = transparentAccount.text;

        this.addSecretKey(text, this._password, alias);
      }

      const { chainId } = this;

      this._keyStore.append(
        crypto.encrypt({
          alias,
          address,
          chainId,
          id,
          parentId,
          password: this._password,
          path,
          text,
          type,
        })
      );

      return {
        id,
        address,
        alias,
        chainId,
        parentId,
        path,
        type,
      };
    } catch (e) {
      console.error(e);
      throw new Error("Could not decrypt mnemonic from password!");
    }
  }

  /**
   * Query accounts from storage (active parent account + associated derived child accounts)
   */
  public async queryAccounts(): Promise<DerivedAccount[]> {
    const activeAccountId = await this.getActiveAccountId();
    const parentAccount = await this._keyStore.getRecord("id", activeAccountId);
    const derivedAccounts =
      (await this._keyStore.getRecords("parentId", activeAccountId)) || [];

    if (parentAccount) {
      const accounts = [parentAccount, ...derivedAccounts];

      // Return only non-encrypted data

      return accounts.map(
        ({ address, alias, chainId, path, parentId, id, type }) => ({
          address,
          alias,
          chainId,
          id,
          parentId,
          path,
          type,
        })
      );
    }
    return [];
  }

  /**
   * Query all top-level parent accounts (mnemonic accounts)
   */
  public async queryParentAccounts(): Promise<DerivedAccount[]> {
    const accounts = await this._keyStore.getRecords(
      "type",
      AccountType.Mnemonic
    );
    // Return only non-encrypted data
    return (accounts || []).map(
      ({ address, alias, chainId, path, parentId, id, type }) => ({
        address,
        alias,
        chainId,
        id,
        parentId,
        path,
        type,
      })
    );
  }

  async encodeInitAccount(
    address: string,
    txMsg: Uint8Array
  ): Promise<Uint8Array> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }
    const account = await this._keyStore.getRecord("address", address);
    if (!account) {
      throw new Error(`Account not found for ${address}`);
    }

    let pk: string;

    try {
      pk = crypto.decrypt(account, this._password, this._cryptoMemory);
    } catch (e) {
      throw new Error(`Could not unlock account for ${address}: ${e}`);
    }

    try {
      const { tx_data } = new Account(txMsg, pk).to_serialized();
      return tx_data;
    } catch (e) {
      throw new Error(`Could not encode InitAccount for ${address}: ${e}`);
    }
  }

  async submitBond(txMsg: Uint8Array): Promise<void> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }

    try {
      await this.sdk.submit_bond(txMsg, this._password);
    } catch (e) {
      throw new Error(`Could not submit bond tx: ${e}`);
    }
  }

  async submitUnbond(txMsg: Uint8Array): Promise<void> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }

    try {
      await this.sdk.submit_unbond(txMsg, this._password);
    } catch (e) {
      throw new Error(`Could not submit unbond tx: ${e}`);
    }
  }
  private async submitTransferChrome(
    txMsg: Uint8Array,
    msgId: string,
    password: string
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
      data: { txMsg: toBase64(txMsg), msgId, password },
    });
  }

  private async submitTransferFirefox(
    txMsg: Uint8Array,
    msgId: string,
    password: string
  ): Promise<void> {
    const routerId = await getAnomaRouterId(this.extensionStore);

    initSubmitTransferWebWorker(
      {
        txMsg: toBase64(txMsg),
        msgId,
        password,
      },
      routerId
    );
  }

  async submitTransfer(txMsg: Uint8Array, msgId: string): Promise<void> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }

    const { TARGET } = process.env;
    if (TARGET === "chrome") {
      this.submitTransferChrome(txMsg, msgId, this._password);
    } else if (TARGET === "firefox") {
      this.submitTransferFirefox(txMsg, msgId, this._password);
    } else {
      console.warn("Submitting transfers is not supported with your browser.");
    }
  }

  async submitIbcTransfer(txMsg: Uint8Array): Promise<void> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }

    try {
      await this.sdk.submit_ibc_transfer(txMsg, this._password);
    } catch (e) {
      throw new Error(`Could not submit ibc transfer tx: ${e}`);
    }
  }

  private async addSecretKey(
    secretKey: string,
    password: string,
    alias: string
  ): Promise<void> {
    this.sdk.add_key(secretKey, password, alias);
    this.sdkStore.set(SDK_KEY, new TextDecoder().decode(this.sdk.encode()));
  }

  private async addSpendingKey(
    spendingKey: Uint8Array,
    password: string,
    alias: string
  ): Promise<void> {
    this.sdk.add_spending_key(spendingKey, password, alias);
    this.sdkStore.set(SDK_KEY, new TextDecoder().decode(this.sdk.encode()));
  }
}
