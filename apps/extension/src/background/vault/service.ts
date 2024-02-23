import { KVStore } from "@namada/storage";
import { Result } from "@namada/utils";
import {
  Keys,
  Schemas,
  VaultStorage,
  VaultTypes,
} from "background/VaultStorage";
import { ExtensionBroadcaster } from "extension";
import * as t from "io-ts";
import { sha256 } from "js-sha256";
import { Crypto } from "./crypto";
import {
  CryptoRecord,
  PrimitiveType,
  ResetPasswordError,
  SessionPassword,
  Vault,
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
    //TODO: improve so we do not "get" two times
    const store =
      (await this.vaultStorage.exists()) && (await this.vaultStorage.get());
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
    const store = await this.vaultStorage.getOrFail();
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

  public async add<T, S extends Schemas>(
    schema: S,
    publicData: t.TypeOf<S>,
    sensitiveData?: T
  ): Promise<Vault<t.TypeOf<S>>> {
    await this.assertIsUnlocked();
    const entry = await this.createVaultEntry<T, S>(publicData, sensitiveData);

    this.vaultStorage.addSpecific(schema, entry);

    return entry;
  }

  protected async findIndexOrFail<S extends Schemas>(
    schema: S,
    prop: keyof t.TypeOf<S>,
    value: string
  ): Promise<number> {
    const storedData = await this.vaultStorage.getSpecificOrFail(schema);

    const output = storedData.findIndex((entry) => {
      const props = entry.public;
      if (!prop) return false;
      return props[prop] === value;
    });

    if (output === -1) {
      throw new Error("Vault entry has not been found");
    }

    return output;
  }

  protected async find<S extends Schemas>(
    schema: S,
    prop?: keyof t.TypeOf<S>,
    value?: PrimitiveType
  ): Promise<Vault<t.TypeOf<S>>[]> {
    const storedData = await this.vaultStorage.getSpecific(schema);
    //TODO: as string
    if (!storedData) {
      return [];
    }

    return storedData.filter((entry) => {
      const props = entry.public;
      if (!prop) return true;
      return props[prop] === value;
    });
  }

  public async findOne<S extends Schemas>(
    schema: S,
    prop?: keyof t.TypeOf<S>,
    value?: PrimitiveType
  ): Promise<Vault<t.TypeOf<S>> | null> {
    const result = await this.find(schema, prop, value);
    return result.length > 0 ? result[0] : null;
  }

  public async findAll<S extends Schemas>(
    schema: S,
    prop?: keyof t.TypeOf<S>,
    value?: PrimitiveType
  ): Promise<Vault<t.TypeOf<S>>[]> {
    return await this.find(schema, prop, value);
  }

  public async findAllOrFail<S extends Schemas>(
    schema: S,
    prop?: keyof t.TypeOf<S>,
    value?: PrimitiveType
  ): Promise<Vault<t.TypeOf<S>>[]> {
    const result = await this.findAll(schema, prop, value);
    if (result.length === 0) {
      throw new Error("No results have been found on Vault");
    }
    return result;
  }

  public async findOneOrFail<S extends Schemas>(
    schema: S,
    prop?: keyof t.TypeOf<S>,
    value?: PrimitiveType
  ): Promise<Vault<t.TypeOf<S>>> {
    const result = await this.find(schema, prop, value);
    if (result.length === 0) {
      throw new Error("No results have been found on Vault");
    }
    return result[0];
  }

  public async update<S extends Schemas>(
    schema: S,
    prop: keyof t.TypeOf<S>,
    value: string,
    newProps: Partial<VaultTypes>
  ): Promise<t.TypeOf<S>> {
    const accountIdx = await this.findIndexOrFail(schema, prop, value);
    const storedData = await this.vaultStorage.getSpecificOrFail(schema);
    const vault = storedData[accountIdx];
    vault.public = { ...vault.public, ...newProps };
    await this.vaultStorage.setSpecific(schema, storedData);

    return vault.public;
  }

  public async remove<S extends Schemas>(
    schema: S,
    prop: keyof VaultTypes,
    value: PrimitiveType
  ): Promise<Vault<t.TypeOf<S>>[]> {
    const storedData = (await this.vaultStorage.getSpecific(schema)) || [];

    const newStore = storedData.filter((entry) => {
      const props = entry.public;
      return props[prop] !== value;
    });

    this.vaultStorage.setSpecific(schema, newStore);

    return newStore;
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

  public async reveal<T, S extends Schemas>(
    entry: Vault<t.TypeOf<S>>
  ): Promise<T | undefined> {
    await this.assertIsUnlocked();
    if (!entry.sensitive) return;

    try {
      const decryptedJson = crypto.decrypt(
        entry.sensitive,
        await this.getPassword(),
        this.cryptoMemory
      );
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

  protected async createVaultEntry<T, S extends Schemas>(
    publicData: t.TypeOf<S>,
    sensitiveData?: T,
    password?: string
  ): Promise<Vault<t.TypeOf<S>>> {
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
