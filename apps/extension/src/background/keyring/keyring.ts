import { v5 as uuid } from "uuid";
import { toBase64 } from "@cosmjs/encoding";

import { KVStore } from "@anoma/storage";
import {
  HDWallet,
  Mnemonic,
  PhraseSize,
  ShieldedHDWallet,
} from "@anoma/crypto";
import {
  Account,
  Address,
  Signer,
  ExtendedSpendingKey,
  ExtendedViewingKey,
  PaymentAddress,
  RevealPk,
  Sdk,
} from "@anoma/shared";
import { IStore, Store } from "@anoma/storage";
import { AccountType, Bip44Path, DerivedAccount, SignedTx } from "@anoma/types";
import { chains } from "@anoma/chains";
import { Crypto } from "./crypto";
import { KeyRingStatus, KeyStore } from "./types";

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

  constructor(
    protected readonly kvStore: KVStore<KeyStore[]>,
    protected readonly sdkStore: KVStore<string>,
    protected readonly chainId: string,
    protected readonly sdk: Sdk
  ) {
    this._keyStore = new Store(KEYSTORE_KEY, kvStore);
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

  public async checkPassword(password: string): Promise<boolean> {
    const mnemonics = await this._keyStore.get();

    // Note: We may support multiple top-level mnemonic seeds in the future,
    // hence why we're storing these in an array. For now, we check for only one:
    if (mnemonics && mnemonics[0]) {
      try {
        crypto.decrypt(mnemonics[0], password);
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
    const words = mnemonic.to_words();
    mnemonic.free();

    return words;
  }

  // Store validated mnemonic
  public async storeMnemonic(
    mnemonic: string[],
    password: string,
    alias?: string
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
      const sk = account.private().to_hex();
      const address = new Address(sk).implicit();
      const { chainId } = this;

      const mnemonicStore = crypto.encrypt({
        id: getId(phrase, (await this._keyStore.get()).length),
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
      await this.addSecretKey(sk, alias);

      this._password = password;
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  public static deriveTransparentAccount(
    seed: Uint8Array,
    path: Bip44Path,
    parentId: string,
    chainId: string
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

    const address = new Address(derivedAccount.private().to_hex()).implicit();
    const id = getId("account", parentId, account, change, index);
    const text = derivedAccount.private().to_hex();

    return {
      address,
      id,
      text,
    };
  }

  public static deriveShieldedAccount(
    seed: Uint8Array,
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
    const viewingKey = new ExtendedViewingKey(xfvk).encode();
    const address = new PaymentAddress(payment_address).encode();

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
    alias?: string
  ): Promise<DerivedAccount> {
    if (!this._password) {
      throw new Error("No password is set!");
    }

    const mnemonics = await this._keyStore.get();

    if (!(mnemonics.length > 0)) {
      throw new Error("No mnemonics have been stored!");
    }

    // TODO: For now, we are assuming only one mnemonic is used, but in the future
    // we may want to have multiple top-level accounts:
    const storedMnemonic = mnemonics[0];

    if (!storedMnemonic) {
      throw new Error("Mnemonic is not set!");
    }

    const parentId = storedMnemonic.id;

    try {
      const phrase = crypto.decrypt(storedMnemonic, this._password);
      const mnemonic = Mnemonic.from_phrase(phrase);
      const seed = mnemonic.to_seed();

      let id: string;
      let address: string;
      let text: string;

      if (type === AccountType.ShieldedKeys) {
        const { spendingKey, ...shieldedAccount } =
          KeyRing.deriveShieldedAccount(seed, path, parentId);
        id = shieldedAccount.id;
        address = shieldedAccount.address;
        text = shieldedAccount.text;

        //TODO: check if shileded accounts require Alias?
        this.addSpendingKey(spendingKey, alias || "");
      } else {
        const transparentAccount = KeyRing.deriveTransparentAccount(
          seed,
          path,
          parentId,
          this.chainId
        );
        id = transparentAccount.id;
        address = transparentAccount.address;
        text = transparentAccount.text;

        this.addSecretKey(text, alias);
      }

      const { chainId } = this;

      this._keyStore.append(
        crypto.encrypt({
          alias,
          address,
          chainId,
          id,
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

  public async queryAccounts(): Promise<DerivedAccount[]> {
    // Query accounts from storage
    const accounts = (await this._keyStore.get()) || [];
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

  async signTx(
    address: string,
    txMsg: Uint8Array,
    txData: Uint8Array
  ): Promise<SignedTx> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }

    const account = await this._keyStore.getRecord("address", address);
    if (!account) {
      throw new Error(`Account not found for ${address}`);
    }

    try {
      const privateKey = this.getPrivateKey(account, this._password);
      const signer = new Signer(txData);
      const { hash, bytes } = signer.sign(txMsg, privateKey);

      return {
        hash,
        bytes: toBase64(bytes),
      };
    } catch (e) {
      throw new Error(`Could not unlock account for ${address}: ${e}`);
    }
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
      pk = crypto.decrypt(account, this._password);
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

  async encodeRevealPk(signer: string): Promise<Uint8Array> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }
    const account = await this._keyStore.getRecord("address", signer);
    if (!account) {
      throw new Error(`Account not found for ${signer}`);
    }

    const privateKey = this.getPrivateKey(account, this._password);

    try {
      const { tx_data } = new RevealPk(privateKey).to_serialized();
      return tx_data;
    } catch (e) {
      throw new Error(`Could not encode RevealPk for ${signer}: ${e}`);
    }
  }

  private getPrivateKey(account: KeyStore, password: string): string {
    const decrypted = crypto.decrypt(account, password);
    let private_key = decrypted;

    // If the account type is a Mnemonic, derive a private key
    // from associated derived address (root account):
    if (account.type === AccountType.Mnemonic) {
      const { path } = account;
      const mnemonic = Mnemonic.from_phrase(decrypted);
      const bip44 = new HDWallet(mnemonic.to_seed());
      const { coinType } = chains[this.chainId].bip44;
      const derivationPath = `m/44'/${coinType}'/${path.account}'/${path.change}`;
      const derived = bip44.derive(derivationPath);
      private_key = derived.private().to_hex();
    }

    return private_key;
  }

  private async addSecretKey(secretKey: string, alias?: string): Promise<void> {
    this.sdk.add_keys(secretKey, alias);
    this.sdkStore.set(SDK_KEY, new TextDecoder().decode(this.sdk.encode()));
  }

  private async addSpendingKey(
    spendingKey: Uint8Array,
    alias: string
  ): Promise<void> {
    this.sdk.add_spending_key(spendingKey, alias);
    this.sdkStore.set(SDK_KEY, new TextDecoder().decode(this.sdk.encode()));
  }
}
