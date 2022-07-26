import { Mnemonic } from "@namada-interface/seed-management";
import { LocalStorageKeys } from "App/types";
import { hashPassword } from "utils/helpers";

class Session {
  public static async getSeed(secret: string): Promise<string | undefined> {
    const mnemonic = await Mnemonic.fromStorageValue(
      hashPassword(secret),
      window.localStorage.getItem(LocalStorageKeys.MasterSeed) || ""
    );
    return mnemonic.phrase;
  }

  public static async setSeed(seed: string, secret: string): Promise<void> {
    const hash = hashPassword(secret);
    const seedStorageValue = await new Mnemonic(seed).toStorageValue(hash);
    window.localStorage.setItem(LocalStorageKeys.MasterSeed, seedStorageValue);
  }

  public static encryptedSeed(): string | null {
    return window.localStorage.getItem(LocalStorageKeys.MasterSeed);
  }
}

export default Session;
