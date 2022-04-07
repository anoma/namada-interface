import { Mnemonic } from "@anoma-apps/seed-management";
import { LocalStorageKeys } from "App/types";
import { aesDecrypt, aesEncrypt } from "utils/helpers";

const { REACT_APP_SECRET_KEY = "" } = process.env;

class Session {
  private _key = REACT_APP_SECRET_KEY;
  private _seed: string;

  constructor() {
    this._seed = window.localStorage.getItem(LocalStorageKeys.MasterSeed) || "";
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
    window.localStorage.setItem(LocalStorageKeys.MasterSeed, this._seed);
    return this;
  }

  public get secret(): string {
    const session = window.localStorage.getItem(LocalStorageKeys.Session) || "";
    return aesDecrypt(session, this._key);
  }

  public set secret(secret: string) {
    window.localStorage.setItem(
      LocalStorageKeys.Session,
      aesEncrypt(secret, this._key)
    );
  }

  public static logout(callback: () => void): void {
    window.localStorage.removeItem(LocalStorageKeys.Session);
    callback();
    window.location.reload();
  }
}

export default Session;
