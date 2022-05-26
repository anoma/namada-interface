import { Mnemonic } from "@anoma-apps/seed-management";
import { LocalStorageKeys } from "App/types";

class Session {
  public static async getSeed(secret: string): Promise<string | undefined> {
    // TODO: Add one-way hashing to provided secret
    const mnemonic = await Mnemonic.fromStorageValue(
      secret,
      window.localStorage.getItem(LocalStorageKeys.MasterSeed) || ""
    );
    return mnemonic.phrase;
  }

  public static async setSeed(seed: string, secret: string): Promise<void> {
    // TODO: Add one-way hashing to provided secret
    const seedStorageValue = await new Mnemonic(seed).toStorageValue(secret);
    window.localStorage.setItem(LocalStorageKeys.MasterSeed, seedStorageValue);
  }

  public static encryptedSeed(): string | null {
    return window.localStorage.getItem(LocalStorageKeys.MasterSeed);
  }
}

export default Session;
