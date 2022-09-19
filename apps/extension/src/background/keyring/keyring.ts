import { KVStore } from "@anoma/storage";
import { AEAD, Mnemonic, PhraseSize } from "@anoma/crypto";
import { v5 as uuid } from "uuid";

const UUID_NAMESPACE = "9bfceade-37fe-11ed-acc0-a3da3461b38c";

export const getId = (name: string, index: number, parentIndex = 0): string => {
  // Ensure a unique UUID
  return uuid(`${name}::${parentIndex}::${index}`, UUID_NAMESPACE);
};

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED,
}

export enum KeyRingStore {
  Mnemonic = "mnemonic",
  Accounts = "accounts",
}

export type Bip44Path = {
  account: number;
  change: number;
  index: number;
};

export type MnemonicStore = {
  id: string;
  phrase: Uint8Array;
};

export type AccountStore = {
  id: string;
  parentId: string;
  description: string;
  bip44Path: Bip44Path;
  private: Uint8Array;
  public: Uint8Array;
  address: string;
};

/*
 Keyring stores keys in persistent backround.
 */
export class KeyRing {
  private _loaded: boolean;

  private _store: KVStore | null;
  private _password: string = "";

  private _mnemonicStore: MnemonicStore[] = [];
  private _accountStore: AccountStore[] = [];

  constructor() {
    this._loaded = false;
    this._store = null;
  }

  public isLocked(): boolean {
    return this._mnemonicStore == null || this._password == null;
  }

  public get status(): KeyRingStatus {
    if (!this._loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (!this._store) {
      return KeyRingStatus.EMPTY;
    } else if (!this.isLocked()) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }

  public async lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    this._mnemonicStore = [];
    this._password = "";
  }

  public async unlock(password: string) {
    if (!this._store) {
      throw new Error("Key ring not initialized");
    }
    // TODO

    this._password = password;
  }

  public async generateMnemonic(size: PhraseSize = PhraseSize.Twelve) {
    const mnemonic = new Mnemonic(size);
    const phrase = mnemonic.phrase();
    const encrypted = AEAD.encrypt_from_string(phrase, this._password);

    // Create mnemonic keystore
    this._mnemonicStore.push({
      id: getId(phrase, this._mnemonicStore.length),
      phrase: encrypted,
    });
  }

  public async update() {
    await this._store?.set<MnemonicStore[]>(
      KeyRingStore.Mnemonic,
      this._mnemonicStore
    );
    await this._store?.set<AccountStore[]>(
      KeyRingStore.Accounts,
      this._accountStore
    );
  }
}
