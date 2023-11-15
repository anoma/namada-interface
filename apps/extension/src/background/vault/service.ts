import { KVStore } from "@namada/storage";
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
import { Result } from "@namada/utils";
import { ExtensionBroadcaster } from "extension";
import { sha256 } from "js-sha256";

export const VAULT_KEY = "vault";
const crypto = new Crypto();

export class VaultService {
  public constructor(
    protected vaultStore: KVStore<VaultStore>,
    protected sessionStore: KVStore<SessionPassword>,
    protected readonly cryptoMemory: WebAssembly.Memory,
    protected readonly broadcaster?: ExtensionBroadcaster
  ) {
    this.initialize();
    this.migrate();
  }

  private migrate(): void {}

  private async initialize(): Promise<void> {
    const vault = await this.vaultStore.get(VAULT_KEY);
    if (!vault) {
      this.reset();
    }
  }

  private async reset(): Promise<void> {
    await this.vaultStore.set(VAULT_KEY, {
      password: undefined,
      data: {},
    });
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
    return await this.vaultStore.get(VAULT_KEY);
  }

  public async getStoreOrFail(): Promise<VaultStore> {
    const storedData = await this.getStoreData();
    if (!storedData) {
      throw new Error("Vault store data has not been initialized");
    }
    return storedData;
  }

  public async add<P, T>(
    key: string,
    publicData: P,
    sensitiveData?: T
  ): Promise<Vault<P>> {
    await this.assertIsUnlocked();
    const entry = await this.createVaultEntry<P, T>(publicData, sensitiveData);
    const storedData = await this.getStoreOrFail();

    if (!Array.isArray(storedData.data[key])) {
      storedData.data[key] = [];
    }

    storedData.data[key].push(entry);
    this.vaultStore.set(VAULT_KEY, storedData);
    return entry;
  }

  protected async findIndexOrFail<P>(
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

  protected async find<P>(
    key: string,
    prop?: keyof P,
    value?: PrimitiveType
  ): Promise<Vault<P>[]> {
    const storedData = await this.getStoreOrFail();
    if (!storedData.data.hasOwnProperty(key)) {
      return [];
    }

    return storedData.data[key].filter((entry) => {
      const props = entry.public as P;
      if (!prop) return true;
      return props[prop] === value;
    }) as Vault<P>[];
  }

  public async findOne<P>(
    key: string,
    prop?: keyof P,
    value?: PrimitiveType
  ): Promise<Vault<P> | null> {
    const result = await this.find<P>(key, prop, value);
    return result.length > 0 ? result[0] : null;
  }

  public async findAll<P>(
    key: string,
    prop?: keyof P,
    value?: PrimitiveType
  ): Promise<Vault<P>[]> {
    return await this.find<P>(key, prop, value);
  }

  public async findAllOrFail<P>(
    key: string,
    prop?: keyof P,
    value?: PrimitiveType
  ): Promise<Vault<P>[]> {
    const result = await this.findAll<P>(key, prop, value);
    if (result.length === 0) {
      throw new Error("No results have been found on Vault");
    }
    return result;
  }

  public async findOneOrFail<P>(
    key: string,
    prop?: keyof P,
    value?: PrimitiveType
  ): Promise<Vault<P>> {
    const result = await this.find<P>(key, prop, value);
    if (result.length === 0) {
      throw new Error("No results have been found on Vault");
    }
    return result[0];
  }

  public async update<P>(
    key: string,
    prop: string,
    value: string,
    newProps: Partial<P>
  ): Promise<P> {
    const accountIdx = await this.findIndexOrFail(key, prop, value);
    const storedData = await this.getStoreOrFail();
    const vault = storedData.data[key][accountIdx] as Vault<P>;
    vault.public = { ...vault.public, ...newProps };
    await this.vaultStore.set(VAULT_KEY, storedData);
    return vault.public;
  }

  public async remove<P>(
    key: string,
    prop: keyof P,
    value: PrimitiveType
  ): Promise<Vault<P>[]> {
    const storedData = await this.getStoreOrFail();
    if (!storedData.data.hasOwnProperty(key)) {
      return [];
    }

    const newStore = storedData.data[key].filter((entry) => {
      const props = entry.public as P;
      return props[prop] !== value;
    }) as Vault<P>[];

    storedData.data[key] = newStore;
    await this.vaultStore.set(VAULT_KEY, storedData);
    return newStore;
  }

  public async createPassword(password: string): Promise<void> {
    if (await this.passwordInitialized()) {
      throw new Error("Password already set");
    }
    await this.vaultStore.set(VAULT_KEY, {
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
      const decryptedJson = await crypto.decrypt(
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

      await this.vaultStore.set(VAULT_KEY, {
        password: await this.getEncryptedPassword(newPassword),
        data: { ...newStore },
      });
      await this.setPassword(newPassword);
      return Result.ok(null);
    } catch (error) {
      throw error;
    }
  }

  protected async createVaultEntry<P, T>(
    publicData: P,
    sensitiveData?: T,
    password?: string
  ): Promise<Vault<P>> {
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
