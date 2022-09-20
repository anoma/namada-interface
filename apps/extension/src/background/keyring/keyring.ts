import { KVStore } from "@anoma/storage";
import { AEAD, Mnemonic, PhraseSize } from "@anoma/crypto";
import {
  KeyRingState,
  KeyRingStatus,
  MnemonicState,
  AccountState,
} from "./types";
import { v5 as uuid } from "uuid";

const UUID_NAMESPACE = "9bfceade-37fe-11ed-acc0-a3da3461b38c";

const getId = (name: string, index: number, parentIndex = 0): string => {
  // Ensure a unique UUID
  return uuid(`${name}::${parentIndex}::${index}`, UUID_NAMESPACE);
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

  public async generateMnemonic(
    size: PhraseSize = PhraseSize.Twelve
  ): Promise<string[]> {
    const mnemonic = new Mnemonic(size);
    const phrase = mnemonic.phrase();

    if (this._state.password) {
      const encrypted = AEAD.encrypt_from_string(phrase, this._state.password);

      // Create mnemonic keystore
      this._state.update({
        mnemonics: [
          ...this._state.mnemonics,
          {
            id: getId(phrase, this._state.mnemonics.length),
            phrase: encrypted,
          },
        ],
      });
      this.update();

      const words = mnemonic.to_words();
      mnemonic.free();

      return words;
    }
    return [];
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
