/* eslint-disable @typescript-eslint/no-explicit-any */
import { KVStore } from "@namada/storage";
import * as E from "fp-ts/Either";
import * as t from "io-ts";

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
export type VaultTypes = KeyStoreType;

const schemas = [KeyStore];
export type Schemas = (typeof schemas)[number];

const keys = ["key-store"] as const;
export type Keys = (typeof keys)[number];
export const schemasMap = new Map<Schemas, Keys>([[KeyStore, "key-store"]]);

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
          sensitive: t.any,
        }),
      ])
    )
  ),
});
type VaultType = t.TypeOf<typeof Vault>;

export class VaultStorage {
  constructor(private readonly provider: KVStore<unknown>) {}

  async getSpecific<S extends Schemas>(
    schema: S
  ): Promise<{ public: t.TypeOf<S>; sensitive?: any }[] | undefined> {
    const storage = await this.provider.get<VaultType>("vault");
    //TODO: as string
    const key = schemasMap.get(schema)!;
    const data = storage?.data[key];

    return data;
  }

  async getSpecificOrFail<S extends Schemas>(
    schema: S
  ): Promise<{ public: t.TypeOf<S>; sensitive?: any }[]> {
    const storage = await this.provider.get<VaultType>("vault");
    //TODO: as string
    const key = schemasMap.get(schema)!;
    const data = storage?.data[key];

    if (!data) {
      throw new Error("TODO");
    }

    return data;
  }

  async setSpecific<S extends Schemas>(
    schema: S,
    data: { public: t.TypeOf<S>; sensitive?: any }[]
  ): Promise<void> {
    const storage = await this.provider.get<VaultType>("vault");
    //TODO: as string
    const key = schemasMap.get(schema)!;
    if (!storage) {
      throw new Error("TODO");
    }
    storage.data[key] = data;
    this.set(storage);
  }

  async addSpecific<S extends Schemas>(
    schema: S,
    //TODO: any for time being
    data: { public: t.TypeOf<S>; sensitive?: any }
  ): Promise<void> {
    const storage = await this.provider.get<VaultType>("vault");
    //TODO: as string
    const key = schemasMap.get(schema)!;
    if (!storage) {
      throw new Error("TODO");
    }
    const currentData = storage.data[key] || [];
    currentData.push(data);
    storage.data[key] = currentData;
    this.set(storage);
  }

  async get(): Promise<VaultType | undefined> {
    const data = await this.provider.get("vault");
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

  async set(data: VaultType): Promise<void> {
    await this.provider.set("vault", data);
  }

  async exists(): Promise<boolean> {
    const vault = await this.get();
    return !!vault;
  }

  async reset(): Promise<void> {
    await this.provider.set("vault", {
      password: undefined,
      data: {},
    });
  }

  validate(data: unknown): VaultType {
    console.log("V", data);
    const decodedData = Vault.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Vault validation failed");
    }

    return decodedData.right;
  }
}
