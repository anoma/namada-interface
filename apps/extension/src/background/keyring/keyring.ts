import { KVStore } from "@anoma/storage";
import { AEAD, HDWallet, Mnemonic, PhraseSize } from "@anoma/crypto";
import { Address } from "@anoma/shared";
import { KeyRingStatus, MnemonicState, AccountState } from "./types";
import { v5 as uuid } from "uuid";
import { Bip44Path, DerivedAccount } from "./types";

import { IStore, Store } from "../types";

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

enum KeyRingStore {
  Mnemonic = "mnemonic",
  Account = "account",
}

/**
 * Keyring stores keys in persisted backround.
 */
export class KeyRing {
  private _mnemonicStore: IStore<MnemonicState>;
  private _accountStore: IStore<AccountState>;
  private _password: string | undefined;
  private _status: KeyRingStatus = KeyRingStatus.Empty;

  constructor(kvStore: KVStore) {
    this._mnemonicStore = new Store(KeyRingStore.Mnemonic, kvStore);
    this._accountStore = new Store(KeyRingStore.Account, kvStore);
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
    const mnemonics = await this._mnemonicStore.get();

    // Note: We may support multiple top-level mnemonic seeds in the future,
    // hence why we're storing these in an array. For now, we check for only one:
    if (mnemonics && mnemonics[0]) {
      const { phrase } = mnemonics[0];
      try {
        AEAD.decrypt(phrase, password);
        return true;
      } catch (error) {
        console.warn(error);
      }
    }

    return false;
  }

  // Return new mnemonic to client for validation
  public async generateMnemonic(
    size: PhraseSize = PhraseSize.Twelve
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
      Mnemonic.validate(phrase);
      const encrypted = AEAD.encrypt(phrase, password);
      await this._mnemonicStore.append({
        id: getId(phrase, (await this._mnemonicStore.get()).length),
        alias,
        phrase: encrypted,
      });

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

    const mnemonics = await this._mnemonicStore.get();

    if (!(mnemonics.length > 0)) {
      throw new Error("No mnemonics have been stored!");
    }

    // TODO: For now, we are assuming only one mnemonic is used, but in the future
    // will want to have multiple top-level accounts:
    const storedMnemonic = mnemonics[0];
    // NOTE: This is hardcoded to 0, but when we have multiple mnemonics, we'll want an
    // indicator to set an ID by mnemonic index, account, change, index so each ID will
    // be a unique value:
    const storedMnemonicIndex = 0;

    if (!storedMnemonic) {
      throw new Error("Mnemonic is not set!");
    }

    try {
      const phrase = AEAD.decrypt(storedMnemonic.phrase, this._password);
      // TODO: Validate derivation path against stored paths under this mnemonic!
      const { account, change, index } = path;
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
      const privateKey = AEAD.encrypt_from_bytes(
        derivedAccount.private().to_bytes(),
        this._password
      );
      const publicKey = AEAD.encrypt_from_bytes(
        derivedAccount.public().to_bytes(),
        this._password
      );
      const address = new Address(derivedAccount.private().to_hex()).implicit();

      const id = getId("account", storedMnemonicIndex, account, change, index);

      this._accountStore.append({
        id,
        address,
        alias,
        bip44Path: path,
        parentId: storedMnemonic.id,
        private: privateKey,
        public: publicKey,
      });

      return {
        id,
        address,
        alias,
        bip44Path: path,
      };
    } catch (e) {
      console.error(e);
      throw new Error("Could not decrypt mnemonic from password!");
    }
  }

  public async queryAccounts(): Promise<DerivedAccount[]> {
    // Query accounts from storage
    const accounts = (await this._accountStore.get()) || [];

    return accounts.map(({ address, alias, bip44Path, id }) => ({
      id,
      address,
      bip44Path,
      alias,
    }));
  }
}
