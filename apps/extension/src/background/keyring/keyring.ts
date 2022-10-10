import { v5 as uuid } from "uuid";
import { toBase64 } from "@cosmjs/encoding";

import { KVStore } from "@anoma/storage";
import { HDWallet, Mnemonic, PhraseSize } from "@anoma/crypto";
import { Account, Address, Signer } from "@anoma/shared";
import { IStore, Store } from "@anoma/storage";
import { AccountType, Bip44Path, DerivedAccount, SignedTx } from "@anoma/types";

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

const KEYSTORE_KEY = "key-store";
const crypto = new Crypto();

/**
 * Keyring stores keys in persisted backround.
 */
export class KeyRing {
  private _keyStore: IStore<KeyStore>;
  private _password: string | undefined;
  private _status: KeyRingStatus = KeyRingStatus.Empty;

  constructor(kvStore: KVStore) {
    this._keyStore = new Store(KEYSTORE_KEY, kvStore);
  }

  public isLocked(): boolean {
    return this._password === undefined;
  }

  public get status(): KeyRingStatus {
    return this._status;
  }

  public async lock(): Promise<void> {
    if (this._status !== KeyRingStatus.Unlocked) {
      throw new Error("Key ring is not unlocked");
    }

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
      // TODO: coinType should match our registered SLIP-0044 type:
      const coinType = 0;
      const path = `m/44'/${coinType}'/0'/0`;
      const bip44 = new HDWallet(seed);
      const account = bip44.derive(path);
      const address = new Address(account.private().to_hex()).implicit();

      const mnemonicStore = crypto.encrypt({
        id: getId(phrase, (await this._keyStore.get()).length),
        alias,
        address,
        password,
        path: {
          account: 0,
          change: 0,
        },
        text: phrase,
        type: AccountType.Mnemonic,
      });
      await this._keyStore.append(mnemonicStore);

      this._password = password;
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  public async deriveAccount(
    path: Bip44Path,
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

    try {
      const phrase = crypto.decrypt(storedMnemonic, this._password);
      // TODO: Validate derivation path against stored paths under this mnemonic!
      const { account, change, index = 0 } = path;
      const root = "m/44'";
      // TODO: This should be defined for our chain (SLIP044)
      const coinType = "0'";
      const derivationPath = [root, coinType, `${account}`, change, index].join(
        "/"
      );
      const mnemonic = Mnemonic.from_phrase(phrase);
      const seed = mnemonic.to_seed();
      const bip44 = new HDWallet(seed);
      const derivedAccount = bip44.derive(derivationPath);

      const address = new Address(derivedAccount.private().to_hex()).implicit();
      const id = getId("account", storedMnemonic.id, account, change, index);
      const type = AccountType.PrivateKey;

      const keyStore = crypto.encrypt({
        alias,
        address,
        id,
        password: this._password,
        path,
        text: derivedAccount.private().to_hex(),
        type,
      });
      this._keyStore.append(keyStore);

      return {
        id,
        address,
        alias,
        parentId: storedMnemonic.id,
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
      ({ address, alias, establishedAddress, path, parentId, id, type }) => ({
        address,
        alias,
        establishedAddress,
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
      const decrypted = crypto.decrypt(account, this._password);
      let pk: string;
      // If the account type is a Mnemonic, derive a private key
      // from associated derived address (root account):
      if (account.type === AccountType.Mnemonic) {
        const { path } = account;
        const mnemonic = Mnemonic.from_phrase(decrypted);
        const bip44 = new HDWallet(mnemonic.to_seed());
        const derivationPath = `m/44'/1'/${path.account}'/${path.change}`;
        const derived = bip44.derive(derivationPath);
        pk = derived.private().to_hex();
      } else {
        pk = decrypted;
      }

      const signer = new Signer(txData);
      const { hash, bytes } = signer.sign(txMsg, pk);
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
}
