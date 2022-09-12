import { KVStore } from "@anoma/storage";

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED,
}

/*
 Keyring stores keys in persistent backround.
 */
export class KeyRing {
  private _loaded: boolean;

  private _mnemonic?: Uint8Array;
  private _keyStore: KVStore | null;
  private _password: string = "";

  constructor() {
    this._loaded = false;
    this._keyStore = null;
  }

  public isLocked(): boolean {
    return this.mnemonic == null || this._password == null;
  }

  private get mnemonic(): Uint8Array | undefined {
    return this._mnemonic;
  }

  private set mnemonic(masterSeed: Uint8Array | undefined) {
    this._mnemonic = masterSeed;
  }

  public get status(): KeyRingStatus {
    if (!this._loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (!this._keyStore) {
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

    this._mnemonic = undefined;
    this._password = "";
  }

  public async unlock(password: string) {
    if (!this._keyStore) {
      throw new Error("Key ring not initialized");
    }
    // TODO

    this._password = password;
  }
}
