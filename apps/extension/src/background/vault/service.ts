import { CryptoRecord } from "@heliaxdev/namada-sdk/web";
import { KVStore } from "@namada/storage";
import { Result } from "@namada/utils";
import { SdkService } from "background/sdk";
import { ExtensionBroadcaster } from "extension";
import { sha256 } from "js-sha256";
import { VaultKeys as Keys, VaultStorage } from "storage";
import { ResetPasswordError, SessionPassword, VaultStoreData } from "./types";

export const VAULT_KEY = "vault";

export class VaultService {
  public constructor(
    protected vaultStorage: VaultStorage,
    protected sessionStore: KVStore<SessionPassword>,
    protected readonly sdkService: SdkService,
    protected readonly broadcaster?: ExtensionBroadcaster
  ) {}

  public async initialize(): Promise<void> {
    const storage = await this.vaultStorage.get();
    if (!storage) {
      await this.vaultStorage.reset();
    }
  }

  public async passwordInitialized(): Promise<boolean> {
    const store = await this.vaultStorage.get();
    return !!(store && store.password);
  }

  public async getLength(key: Keys): Promise<number> {
    const store = await this.vaultStorage.getOrFail();
    return Object.keys(store.data[key] || {}).length;
  }

  public async isLocked(): Promise<boolean> {
    const password = await this.getPassword();
    const isInitialized = await this.passwordInitialized();
    return !password && isInitialized;
  }

  public async logout(): Promise<void> {
    await this.vaultStorage.reset();
    await this.setPassword(undefined);
  }

  public async assertIsUnlocked(): Promise<void> {
    if (await this.isLocked()) {
      throw new Error("Extension is locked");
    }
  }

  public async lock(): Promise<void> {
    await this.setPassword(undefined);
    if (this.broadcaster) {
      await this.broadcaster.lockExtension();
    }
  }

  public async unlock(password: string): Promise<boolean> {
    if (await this.checkPassword(password)) {
      await this.setPassword(password);
      return true;
    }
    return false;
  }

  public hashPassword = async (password: string): Promise<string> => {
    const hash = sha256.create();
    hash.update(password);
    return hash.toString();
  };

  protected async setPassword(password: string | undefined): Promise<void> {
    if (!password) {
      await this.sessionStore.set("password", "");
      return;
    }
    await this.sessionStore.set("password", await this.hashPassword(password));
  }

  protected async getPassword(): Promise<string> {
    return (await this.sessionStore.get("password")) || "";
  }

  // TODO: I think we shouldn't expose the password like this, but it's required
  // for SDK methods. Use cautiously.
  public async UNSAFE_getPassword(): Promise<string> {
    return await this.getPassword();
  }

  public async checkPassword(password: string): Promise<boolean> {
    const store = await this.vaultStorage.getOrFail();
    if (!store.password) {
      throw new Error("Password not initialized");
    }

    const { crypto } = this.sdkService.getSdk();

    try {
      crypto.decrypt(store.password, await this.hashPassword(password));

      return true;
    } catch (error) {
      console.warn(error);
    }

    return false;
  }

  public async createPassword(password: string): Promise<void> {
    if (await this.passwordInitialized()) {
      throw new Error("Password already set");
    }
    const store = await this.vaultStorage.getOrFail();

    await this.vaultStorage.set({
      password: await this.getEncryptedPassword(password),
      data: store.data,
    });

    const isUnlocked = await this.unlock(password);
    if (!isUnlocked) {
      throw new Error(
        "Not possible to unlock the vault after creating the password"
      );
    }
  }

  public async reveal<T>(sensitive?: CryptoRecord): Promise<T | undefined> {
    await this.assertIsUnlocked();
    if (!sensitive) return;

    const { crypto } = this.sdkService.getSdk();

    try {
      const decryptedJson = crypto.decrypt(sensitive, await this.getPassword());
      return JSON.parse(decryptedJson) as T;
    } catch (error) {
      console.error(error);
      throw new Error("An error occurred decrypting the Vault");
    }
  }

  // Reset password by re-encrypting secrets with new password.
  public async resetPassword(
    oldPassword: string,
    newPassword: string
  ): Promise<Result<null, ResetPasswordError>> {
    if (!(await this.unlock(oldPassword))) {
      return Result.err(ResetPasswordError.BadPassword);
    }

    const storedData = await this.vaultStorage.getOrFail();
    try {
      const newStore: VaultStoreData = {};
      const data = storedData.data;
      for (const key of Object.keys(data) as Array<keyof typeof data>) {
        newStore[key] = [];
        for (const vault of storedData.data[key]) {
          const sensitiveInfo = await this.reveal(vault.sensitive);
          const newSensitive = await this.encryptSensitiveData(
            sensitiveInfo,
            newPassword
          );
          newStore[key].push({
            public: vault.public,
            sensitive: newSensitive,
          });
        }
      }

      const validated = this.vaultStorage.validate({
        password: await this.getEncryptedPassword(newPassword),
        data: newStore,
      });

      await this.vaultStorage.set(validated);
      await this.setPassword(newPassword);
      return Result.ok(null);
    } catch (error) {
      throw error;
    }
  }

  public async encryptSensitiveData<T>(
    sensitiveData: T,
    password?: string
  ): Promise<CryptoRecord> {
    const { crypto } = this.sdkService.getSdk();
    const pwd =
      password ? await this.hashPassword(password) : await this.getPassword();
    return crypto.encrypt(JSON.stringify(sensitiveData), pwd);
  }

  protected async getEncryptedPassword(
    password: string
  ): Promise<CryptoRecord> {
    const { crypto } = this.sdkService.getSdk();
    const hashedPassword = await this.hashPassword(password);
    return crypto.encrypt(hashedPassword, hashedPassword);
  }
}
