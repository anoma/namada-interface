import { Mnemonic } from "@anoma/seed-management";
import { hashPassword } from "@anoma/utils";

const STORAGE_KEY = "com.anoma.net::seed";

class Session {
  public static async getSeed(secret: string): Promise<string | undefined> {
    const mnemonic = await Mnemonic.fromStorageValue(
      hashPassword(secret),
      window.localStorage.getItem(STORAGE_KEY) || ""
    );
    return mnemonic.phrase;
  }

  public static async setSeed(seed: string, secret: string): Promise<void> {
    const hash = hashPassword(secret);
    const seedStorageValue = await new Mnemonic(seed).toStorageValue(hash);
    window.localStorage.setItem(STORAGE_KEY, seedStorageValue);
  }

  public static encryptedSeed(): string | null {
    return window.localStorage.getItem(STORAGE_KEY);
  }
}

export default Session;
