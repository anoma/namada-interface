import { KVStore } from "@anoma/storage";
import { AEAD, Bip44, Mnemonic, PhraseSize } from "@anoma/crypto";
import { Address } from "@anoma/shared";
import {
  KeyRingState,
  KeyRingStatus,
  MnemonicState,
  AccountState,
} from "./types";
import { v5 as uuid } from "uuid";
import { Bip44Path, DerivedAccount } from "./types";

// Generated UUID namespace for uuid v5
const UUID_NAMESPACE = "9bfceade-37fe-11ed-acc0-a3da3461b38c";

// Construct unique uuid, passing in an arbitray number of arguments.
// This could be a unique parameter of the object receiving the id,
// or an index based on the number of existing objects in a hierarchy.
const getId = (name: string, ...args: (number | string)[]): string => {
  // Ensure a unique UUID
  let uuidName = name;

  // Concatenate any number of args onto the name parameter
  for (const arg in args) {
    uuidName = `${uuidName}::${arg}`;
  }
  return uuid(uuidName, UUID_NAMESPACE);
};

enum KeyRingStore {
  Mnemonic = "mnemonic",
  Accounts = "accounts",
}

/*
 Keyring stores keys in persistent backround.
 */
export class KeyRing {
  private _state = new KeyRingState({
    password: undefined,
    status: KeyRingStatus.EMPTY,
    mnemonics: [],
    accounts: [],
  });

  private _store: KVStore | null;

  constructor() {
    this._store = null;
  }

  public isLocked(): boolean {
    return !this._state.password;
  }

  public get status(): KeyRingStatus {
    return this._state.status;
  }

  public async lock() {
    if (this._state.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }
    this._state.update({
      mnemonics: [],
      accounts: [],
      password: undefined,
      status: KeyRingStatus.LOCKED,
    });
  }

  public async unlock(password: string) {
    if (!this._store) {
      throw new Error("Key ring not initialized");
    }
    if (this.status !== KeyRingStatus.LOCKED) {
      throw new Error("Key ring is not locked!");
    }

    // Note: We may support multiple top-level mnemonic seeds in the future,
    // hence why we're storing these in an array. For now, we check for only one:
    const mnemonics = await this._store?.get<MnemonicState[]>(
      KeyRingStore.Mnemonic
    );
    if (await this.checkPassword(password)) {
      const accounts = await this._store.get<AccountState[]>(
        KeyRingStore.Accounts
      );
      this._state.update({
        status: KeyRingStatus.UNLOCKED,
        accounts,
        mnemonics,
        password,
      });
    }
  }

  public async checkPassword(password: string): Promise<boolean> {
    const mnemonics = await this._store?.get<MnemonicState[]>(
      KeyRingStore.Mnemonic
    );

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
    description?: string
  ): Promise<boolean> {
    if (!password) {
      throw new Error("Password is not provided! Cannot store mnemonic");
    }
    const phrase = mnemonic.join(" ");

    try {
      Mnemonic.validate(phrase);
      const encrypted = AEAD.encrypt(phrase, password);
      // Validate mnemonic
      // Create mnemonic keystore
      this._state.update({
        password,
        mnemonics: [
          ...this._state.mnemonics,
          {
            id: getId(phrase, this._state.mnemonics.length),
            description,
            phrase: encrypted,
          },
        ],
      });
      this.update();
      console.log("STATE", this._state);
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  public async deriveAccount(
    path: Bip44Path,
    description?: string
  ): Promise<DerivedAccount> {
    if (!this._state.password) {
      throw new Error("No password is set!");
    }

    const storedMnemonic = this._state.mnemonics[0];

    if (!storedMnemonic) {
      throw new Error("Mnemonic is not set!");
    }

    try {
      const phrase = AEAD.decrypt(storedMnemonic.phrase, this._state.password);
      // TODO: Validate derivation path against stored paths under this mnemonic!
      const { account, change, index } = path;
      const fragment = `${account}'/${change}'/${index}'`;
      const root = "m/44'";
      const derivationPath = [root, fragment].join("/");
      const mnemonic = Mnemonic.from_phrase(phrase);
      const seed = mnemonic.to_seed();
      const bip44 = new Bip44(seed);
      const derivedAccount = bip44.derive(derivationPath);
      const privateKey = AEAD.encrypt_from_bytes(
        derivedAccount.private().to_bytes(),
        this._state.password
      );
      const publicKey = AEAD.encrypt_from_bytes(
        derivedAccount.public().to_bytes(),
        this._state.password
      );
      const address = new Address(derivedAccount.private().to_hex()).implicit();
      // TODO: Establish address on the ledger:
      const establishedAddress = "";

      this._state.update({
        accounts: [
          ...this._state.accounts,
          {
            id: getId("account", account, change, index),
            parentId: storedMnemonic.id,
            bip44Path: path,
            address,
            establishedAddress,
            private: privateKey,
            public: publicKey,
            description,
          },
        ],
      });
      this.update();

      return {
        bip44Path: path,
        address,
        establishedAddress,
      };
    } catch (e) {
      throw new Error("Could not decrypt mnemonic from password!");
    }
  }

  public async update() {
    await this._store?.set<MnemonicState[]>(
      KeyRingStore.Mnemonic,
      this._state.mnemonics
    );
    await this._store?.set<AccountState[]>(
      KeyRingStore.Accounts,
      this._state.accounts
    );
  }
}
