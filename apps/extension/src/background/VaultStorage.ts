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

type KeyStoreType = t.TypeOf<typeof KeyStore>;
export type VaultTypes = KeyStoreType;

const schemas = [KeyStore];
export type Schemas = (typeof schemas)[number];
const schemasMap = new Map<Schemas, string>([[KeyStore, "key-store"]]);

const Vault = t.type({
  //TODO: any for time being
  password: t.any,
  data: t.record(
    t.keyof({ [schemasMap.get(KeyStore) as string]: null }),
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

  async get(): Promise<VaultType | undefined> {
    const data = await this.provider.get("vault");
    const decodedData = Vault.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Chain is not valid");
    }

    return decodedData.right;
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
}
