import { Mnemonic } from "@anoma-apps/seed-management";
import { LocalStorage } from "App/types";
import { aesDecrypt, aesEncrypt } from "utils/helpers";

const { REACT_APP_SECRET_KEY = "" } = process.env;

class Session {
  private _key = REACT_APP_SECRET_KEY;
  private _seed: string;

  constructor() {
    this._seed = window.localStorage.getItem(LocalStorage.MasterSeedKey) || "";
  }

  public async seed(): Promise<string | undefined> {
    if (this.secret && this._seed) {
      const mnemonic = await Mnemonic.fromStorageValue(this.secret, this._seed);
      return mnemonic.phrase;
    }
  }

  public get encryptedSeed(): string {
    return this._seed;
  }

  public async setSeed(seed: string): Promise<Session> {
    this._seed = await new Mnemonic(seed).toStorageValue(this.secret);
    window.localStorage.setItem(LocalStorage.MasterSeedKey, this._seed);
    return this;
  }

  public get secret(): string {
    const session = window.localStorage.getItem(LocalStorage.SessionKey) || "";
    return aesDecrypt(session, this._key);
  }

  public set secret(secret: string) {
    window.localStorage.setItem(
      LocalStorage.SessionKey,
      aesEncrypt(secret, this._key)
    );
  }

  public static logout(callback: () => void): void {
    window.localStorage.removeItem(LocalStorage.SessionKey);
    callback();
    window.location.reload();
  }
}

export default Session;
