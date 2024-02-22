import { KVStore } from "@namada/storage";
import { Result } from "@namada/utils";
import { VaultStorage, VaultTypes } from "background/VaultStorage";
import { ExtensionBroadcaster } from "extension";
import { sha256 } from "js-sha256";
import { Crypto } from "./crypto";
import {
  CryptoRecord,
  PrimitiveType,
  ResetPasswordError,
  SessionPassword,
  Vault,
  VaultStore,
  VaultStoreData,
} from "./types";

export const VAULT_KEY = "vault";
const crypto = new Crypto();

export class VaultService {
  public constructor(
    protected vaultStorage: VaultStorage,
    protected sessionStore: KVStore<SessionPassword>,
    protected readonly cryptoMemory: WebAssembly.Memory,
    protected readonly broadcaster?: ExtensionBroadcaster
  ) {
    this.initialize();
    this.migrate();
  }

  private migrate(): void {}

  private async initialize(): Promise<void> {
    const exists = await this.vaultStorage.exists();
    if (!exists) {
      this.reset();
    }
  }

  private async reset(): Promise<void> {
    await this.vaultStorage.reset();
  }

  public async passwordInitialized(): Promise<boolean> {
    const store = await this.getStoreData();
    return !!(store && store.password);
  }

  public async getLength(key: string): Promise<number> {
    const store = await this.getStoreOrFail();
    return Object.keys(store.data[key] || {}).length;
  }

  public async isLocked(): Promise<boolean> {
    const password = await this.getPassword();
    const isInitialized = await this.passwordInitialized();
    return !password && isInitialized;
  }

  public async logout(): Promise<void> {
    await this.reset();
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
      this.sessionStore.set("password", "");
      return;
    }
    this.sessionStore.set("password", await this.hashPassword(password));
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
    const store = await this.getStoreOrFail();
    if (!store.password) {
      throw new Error("Password not initialized");
    }

    try {
      crypto.decrypt(
        store.password,
        await this.hashPassword(password),
        this.cryptoMemory
      );
      return true;
    } catch (error) {
      console.warn(error);
    }

    return false;
  }

  public async getStoreData(): Promise<VaultStore | undefined> {
    return await this.vaultStorage.get();
  }

  public async getStoreOrFail(): Promise<VaultStore> {
    const storedData = await this.getStoreData();
    if (!storedData) {
      throw new Error("Vault store data has not been initialized");
    }
    return storedData;
  }

  public async add<T>(
    key: string,
    publicData: VaultTypes,
    sensitiveData?: T
  ): Promise<Vault> {
    await this.assertIsUnlocked();
    const entry = await this.createVaultEntry<T>(publicData, sensitiveData);

    const storedData = await this.vaultStorage.getOrFail();

    if (!Array.isArray(storedData.data[key])) {
      storedData.data[key] = [];
    }
    storedData.data[key].push(entry);
    this.vaultStorage.set(storedData);

    return entry;
  }

  protected async findIndexOrFail<P extends VaultTypes>(
    key: string,
    prop: keyof P,
    value: string
  ): Promise<number> {
    const storedData = await this.getStoreOrFail();
    if (!storedData.data.hasOwnProperty(key)) {
      throw new Error("Database key is not valid. Value provided: " + key);
    }

    const output = storedData.data[key].findIndex((entry) => {
      const props = entry.public as P;
      if (!prop) return false;
      return props[prop] === value;
    });

    if (output === -1) {
      throw new Error("Vault entry has not been found");
    }

    return output;
  }

  protected async find(
    key: string,
    prop?: keyof VaultTypes,
    value?: PrimitiveType
  ): Promise<Vault[]> {
    const storedData = await this.getStoreOrFail();
    if (!storedData.data.hasOwnProperty(key)) {
      return [];
    }

    return storedData.data[key].filter((entry) => {
      const props = entry.public;
      if (!prop) return true;
      return props[prop] === value;
    }) as Vault[];
  }

  public async findOne(
    key: string,
    prop?: keyof VaultTypes,
    value?: PrimitiveType
  ): Promise<Vault | null> {
    const result = await this.find(key, prop, value);
    return result.length > 0 ? result[0] : null;
  }

  public async findAll(
    key: string,
    prop?: keyof VaultTypes,
    value?: PrimitiveType
  ): Promise<Vault[]> {
    return await this.find(key, prop, value);
  }

  public async findAllOrFail(
    key: string,
    prop?: keyof VaultTypes,
    value?: PrimitiveType
  ): Promise<Vault[]> {
    const result = await this.findAll(key, prop, value);
    if (result.length === 0) {
      throw new Error("No results have been found on Vault");
    }
    return result;
  }

  public async findOneOrFail(
    key: string,
    prop?: keyof VaultTypes,
    value?: PrimitiveType
  ): Promise<Vault> {
    const result = await this.find(key, prop, value);
    if (result.length === 0) {
      throw new Error("No results have been found on Vault");
    }
    return result[0];
  }

  public async update(
    key: string,
    prop: keyof VaultTypes,
    value: string,
    newProps: Partial<VaultTypes>
  ): Promise<VaultTypes> {
    const accountIdx = await this.findIndexOrFail(key, prop, value);
    const storedData = await this.getStoreOrFail();
    const vault = storedData.data[key][accountIdx] as Vault;
    vault.public = { ...vault.public, ...newProps };
    await this.vaultStorage.set(storedData);
    return vault.public;
  }

  public async remove(
    key: string,
    prop: keyof VaultTypes,
    value: PrimitiveType
  ): Promise<Vault[]> {
    const storedData = await this.getStoreOrFail();
    if (!storedData.data.hasOwnProperty(key)) {
      return [];
    }

    const newStore = storedData.data[key].filter((entry) => {
      const props = entry.public;
      return props[prop] !== value;
    }) as Vault[];

    storedData.data[key] = newStore;
    await this.vaultStorage.set(storedData);
    return newStore;
  }

  public async createPassword(password: string): Promise<void> {
    if (await this.passwordInitialized()) {
      throw new Error("Password already set");
    }
    await this.vaultStorage.set({
      password: await this.getEncryptedPassword(password),
      data: {},
    });

    const isUnlocked = await this.unlock(password);
    if (!isUnlocked) {
      throw new Error(
        "Not possible to unlock the vault after creating the password"
      );
    }
  }

  public async reveal<S>(entry: Vault): Promise<S | undefined> {
    await this.assertIsUnlocked();
    if (!entry.sensitive) return;

    try {
      const decryptedJson = crypto.decrypt(
        entry.sensitive,
        await this.getPassword(),
        this.cryptoMemory
      );
      return JSON.parse(decryptedJson) as S;
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

    const storedData = await this.getStoreOrFail();
    try {
      const newStore: VaultStoreData = {};
      for (const key in storedData.data) {
        newStore[key] = [];
        for (const vault of storedData.data[key]) {
          const sensitiveInfo = await this.reveal(vault);
          newStore[key].push(
            await this.createVaultEntry(
              vault.public,
              sensitiveInfo,
              newPassword
            )
          );
        }
      }

      await this.vaultStorage.set({
        password: await this.getEncryptedPassword(newPassword),
        data: { ...newStore },
      });
      await this.setPassword(newPassword);
      return Result.ok(null);
    } catch (error) {
      throw error;
    }
  }

  protected async createVaultEntry<T>(
    publicData: VaultTypes,
    sensitiveData?: T,
    password?: string
  ): Promise<Vault> {
    let encryptedData;
    if (sensitiveData) {
      encryptedData = crypto.encrypt(
        JSON.stringify(sensitiveData),
        password ? await this.hashPassword(password) : await this.getPassword()
      );
    }
    return {
      public: { ...publicData },
      sensitive: { ...encryptedData } as CryptoRecord,
    };
  }

  protected async getEncryptedPassword(
    password: string
  ): Promise<CryptoRecord> {
    const hashedPassword = await this.hashPassword(password);
    return crypto.encryptAuthKey(hashedPassword, hashedPassword);
  }
}
