import { KVStore } from "@anoma/storage";
import { AEAD, Mnemonic, PhraseSize } from "@anoma/crypto";
import {
  KeyRingState,
  KeyRingStatus,
  MnemonicState,
  AccountState,
} from "./types";
import { v5 as uuid } from "uuid";

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
    password: string
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
