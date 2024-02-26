import { KVStore } from "@namada/storage";
import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { ExtStorage } from "./Storage";
import { CryptoRecord, PrimitiveType } from "./vault";

const Uint8ArrayCodec = new t.Type<Uint8Array, Uint8Array, unknown>(
  "Uint8Array",
  (u): u is Uint8Array => u instanceof Uint8Array,
  (u, c) => {
    try {
      const a = Array.from(u as Uint8Array);
      return t.success(Uint8Array.from(a));
    } catch (e) {
      return t.failure(u, c);
    }
  },
  t.identity
);

enum KdfType {
  Argon2 = "argon2",
  Scrypt = "scrypt",
}

export const Sensitive = t.type({
  cipher: t.type({
    type: t.literal("aes-256-gcm"),
    iv: Uint8ArrayCodec,
    text: Uint8ArrayCodec,
  }),
  kdf: t.type({
    type: t.keyof({
      [KdfType.Argon2]: null,
      [KdfType.Scrypt]: null,
    }),
    params: t.any,
  }),
});

enum AccountType {
  Mnemonic = "mnemonic",
  PrivateKey = "private-key",
  ShieldedKeys = "shielded-keys",
  Ledger = "ledger",
}

export const KeyStore = t.exact(
  t.intersection([
    t.type({
      id: t.string,
      alias: t.string,
      address: t.string,
      owner: t.string,
      path: t.type({
        account: t.number,
        change: t.number,
        index: t.number,
      }),
      type: t.keyof({
        [AccountType.Mnemonic]: null,
        [AccountType.PrivateKey]: null,
        [AccountType.ShieldedKeys]: null,
        [AccountType.Ledger]: null,
      }),
    }),
    t.partial({
      publicKey: t.string,
      parentId: t.string,
    }),
  ])
);
export type KeyStoreType = t.TypeOf<typeof KeyStore>;

const Vault = t.type({
  //TODO: any for time being
  password: t.any,
  data: t.record(
    t.string,
    t.array(
      t.intersection([
        t.type({
          public: KeyStore,
        }),
        t.partial({
          sensitive: Sensitive,
        }),
      ])
    )
  ),
});
type VaultType = t.TypeOf<typeof Vault>;

export type VaultTypes = KeyStoreType;

export type Schemas = typeof KeyStore;

const keys = ["key-store"] as const;
export type Keys = (typeof keys)[number];

export const schemasMap = new Map<Schemas, Keys>([[KeyStore, "key-store"]]);

export class VaultStorage extends ExtStorage {
  constructor(provider: KVStore<unknown>) {
    super(provider);
  }

  public validate(data: unknown): VaultType {
    const decodedData = Vault.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Vault validation failed");
    }

    return decodedData.right;
  }

  public async get(): Promise<VaultType | undefined> {
    const data = await this.getRaw("vault");
    const Schema = t.union([Vault, t.undefined]);
    const decoded = Schema.decode(data);

    if (E.isLeft(decoded)) {
      throw new Error("Vault is not valid");
    }

    return decoded.right;
  }

  public async getOrFail(): Promise<VaultType> {
    const storedData = await this.get();
    if (!storedData) {
      throw new Error("Vault store data has not been initialized");
    }
    return storedData;
  }

  public async findOne<S extends Schemas>(
    schema: S,
    prop?: keyof t.TypeOf<S>,
    value?: PrimitiveType
  ): Promise<{ public: t.TypeOf<S>; sensitive?: CryptoRecord } | null> {
    const result = await this.find(schema, prop, value);
    return result.length > 0 ? result[0] : null;
  }

  public async findOneOrFail<S extends Schemas>(
    schema: S,
    prop?: keyof t.TypeOf<S>,
    value?: PrimitiveType
  ): Promise<{ public: t.TypeOf<S>; sensitive?: CryptoRecord }> {
    const result = await this.find(schema, prop, value);
    if (result.length === 0) {
      throw new Error("No results have been found on Vault");
    }
    return result[0];
  }

  public async findAll<S extends Schemas>(
    schema: S,
    prop?: keyof t.TypeOf<S>,
    value?: PrimitiveType
  ): Promise<{ public: t.TypeOf<S>; sensitive?: CryptoRecord }[]> {
    return await this.find(schema, prop, value);
  }

  public async findAllOrFail<S extends Schemas>(
    schema: S,
    prop?: keyof t.TypeOf<S>,
    value?: PrimitiveType
  ): Promise<{ public: t.TypeOf<S>; sensitive?: CryptoRecord }[]> {
    const result = await this.findAll(schema, prop, value);
    if (result.length === 0) {
      throw new Error("No results have been found on Vault");
    }
    return result;
  }

  public async set(data: VaultType): Promise<void> {
    await this.setRaw("vault", data);
  }

  public async add<S extends Schemas>(
    schema: S,
    data: { public: t.TypeOf<S>; sensitive: CryptoRecord }
  ): Promise<void> {
    const storage = await this.getRaw<VaultType>("vault");
    if (!storage) {
      throw new Error("Vault store data has not been initialized");
    }
    const key = this.getKey(schema);

    const currentData = storage.data[key] || [];
    currentData.push(data);
    storage.data[key] = currentData;
    this.set(storage);
  }

  public async update<S extends Schemas>(
    schema: S,
    prop: keyof t.TypeOf<S>,
    value: string,
    newProps: Partial<VaultTypes>
  ): Promise<t.TypeOf<S>> {
    const accountIdx = await this.findIndexOrFail(schema, prop, value);
    const storedData = await this.getSpecificOrFail(schema);
    const vault = storedData[accountIdx];
    vault.public = { ...vault.public, ...newProps };
    await this.setSpecific(schema, storedData);

    return vault.public;
  }

  public async remove<S extends Schemas>(
    schema: S,
    prop: keyof VaultTypes,
    value: PrimitiveType
  ): Promise<{ public: t.TypeOf<S> }[]> {
    const storedData = (await this.getSpecific(schema)) || [];

    const newStore = storedData.filter((entry) => {
      const props = entry.public;
      return props[prop] !== value;
    });

    this.setSpecific(schema, newStore);

    return newStore;
  }

  public async reset(): Promise<void> {
    await this.setRaw("vault", {
      password: undefined,
      data: {},
    });
  }

  private async getSpecific<S extends Schemas>(
    schema: S
  ): Promise<{ public: t.TypeOf<S>; sensitive?: CryptoRecord }[] | undefined> {
    const storage = await this.getRaw<VaultType>("vault");
    const key = this.getKey(schema);
    const data = storage?.data[key];

    return data;
  }

  private async getSpecificOrFail<S extends Schemas>(
    schema: S
  ): Promise<{ public: t.TypeOf<S>; sensitive?: CryptoRecord }[]> {
    const storage = await this.getRaw<VaultType>("vault");
    const key = this.getKey(schema);
    const data = storage?.data[key];

    if (!data) {
      throw new Error("TODO");
    }

    return data;
  }

  private async setSpecific<S extends Schemas>(
    schema: S,
    data: { public: t.TypeOf<S>; sensitive?: CryptoRecord }[]
  ): Promise<void> {
    const storage = await this.getRaw<VaultType>("vault");
    if (!storage) {
      throw new Error("Vault store data has not been initialized");
    }
    const key = this.getKey(schema);
    storage.data[key] = data;
    this.set(storage);
  }

  private async findIndexOrFail<S extends Schemas>(
    schema: S,
    prop: keyof t.TypeOf<S>,
    value: string
  ): Promise<number> {
    const storedData = await this.getSpecificOrFail(schema);

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

  private async find<S extends Schemas>(
    schema: S,
    prop?: keyof t.TypeOf<S>,
    value?: PrimitiveType
  ): Promise<{ public: t.TypeOf<S>; sensitive?: CryptoRecord }[]> {
    const storedData = await this.getSpecific(schema);
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

  private getKey<S extends Schemas>(schema: S): Keys {
    const key = schemasMap.get(schema);
    if (!key) {
      throw new Error(`Could not find key for schema: ${schema}`);
    }

    return key;
  }
}
