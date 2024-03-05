import { KVStore } from "@namada/storage";
import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { ExtStorage } from "./Storage";

enum BridgeType {
  IBC = "ibc",
  Ethereum = "ethereum-bridge",
}

const Chain = t.intersection([
  t.type({
    alias: t.string,
    bech32Prefix: t.string,
    bip44: t.type({
      coinType: t.number,
    }),
    bridgeType: t.array(
      t.keyof({ [BridgeType.IBC]: null, [BridgeType.Ethereum]: null })
    ),
    chainId: t.string,
    currency: t.intersection([
      t.type({
        symbol: t.string,
        token: t.string,
      }),
      t.partial({
        address: t.string,
        gasPriceStep: t.type({
          average: t.number,
          high: t.number,
          low: t.number,
        }),
      }),
    ]),
    extension: t.type({
      alias: t.string,
      id: t.keyof({ namada: null, keplr: null, metamask: null }),
      url: t.string,
    }),
    id: t.keyof({
      namada: null,
      cosmos: null,
      ethereum: null,
    }),
    rpc: t.string,
  }),
  t.partial({
    ibc: t.type({
      portId: t.string,
    }),
  }),
]);
type ChainType = t.TypeOf<typeof Chain>;

const NamadaExtensionApprovedOrigins = t.array(t.string);
type NamadaExtensionApprovedOriginsType = t.TypeOf<
  typeof NamadaExtensionApprovedOrigins
>;

const NamadaExtensionRouterId = t.number;
type NamadaExtensionRouterIdType = t.TypeOf<typeof NamadaExtensionRouterId>;

const Tabs = t.array(t.type({ tabId: t.number, timestamp: t.number }));
type TabsType = t.TypeOf<typeof Tabs>;

type LocalStorageTypes =
  | ChainType
  | NamadaExtensionApprovedOriginsType
  | NamadaExtensionRouterIdType
  | TabsType;

type LocalStorageSchemas =
  | typeof Chain
  | typeof NamadaExtensionApprovedOrigins
  | typeof NamadaExtensionRouterId
  | typeof Tabs;

export type LocalStorageKeys =
  | "chains"
  | "namadaExtensionApprovedOrigins"
  | "namadaExtensionRouterId"
  | "tabs";

const schemasMap = new Map<LocalStorageSchemas, LocalStorageKeys>([
  [Chain, "chains"],
  [NamadaExtensionApprovedOrigins, "namadaExtensionApprovedOrigins"],
  [NamadaExtensionRouterId, "namadaExtensionRouterId"],
  [Tabs, "tabs"],
]);

export class LocalStorage extends ExtStorage {
  constructor(provider: KVStore<LocalStorageTypes>) {
    super(provider);
  }

  async getChain(): Promise<ChainType | undefined> {
    const data = await this.getRaw(this.getKey(Chain));

    const Schema = t.union([Chain, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Chain is not valid");
    }

    return decodedData.right;
  }

  async setChain(chain: ChainType): Promise<void> {
    await this.setRaw(this.getKey(Chain), chain);
  }

  async getApprovedOrigins(): Promise<
    NamadaExtensionApprovedOriginsType | undefined
  > {
    const data = await this.getRaw(this.getKey(NamadaExtensionApprovedOrigins));

    const Schema = t.union([NamadaExtensionApprovedOrigins, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Approved Origins are not valid");
    }

    return decodedData.right;
  }

  async addApprovedOrigin(originToAdd: string): Promise<void> {
    const data = (await this.getApprovedOrigins()) || [];
    this.setApprovedOrigins([...data, originToAdd]);
  }

  async removeApprovedOrigin(originToRemove: string): Promise<void> {
    const data = (await this.getApprovedOrigins()) || [];
    this.setApprovedOrigins(data.filter((origin) => origin !== originToRemove));
  }

  async getRouterId(): Promise<NamadaExtensionRouterIdType | undefined> {
    const data = await this.getRaw(this.getKey(NamadaExtensionRouterId));

    const Schema = t.union([NamadaExtensionRouterId, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("RouterId is not valid");
    }

    return decodedData.right;
  }

  async setRouterId(id: NamadaExtensionRouterIdType): Promise<void> {
    await this.setRaw(this.getKey(NamadaExtensionRouterId), id);
  }

  async getTabs(): Promise<TabsType | undefined> {
    const data = await this.getRaw(this.getKey(Tabs));
    const Schema = t.union([Tabs, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Tabs are not valid");
    }

    return decodedData.right;
  }

  async setTabs(tabs: TabsType): Promise<void> {
    await this.setRaw(this.getKey(Tabs), tabs);
  }

  private async setApprovedOrigins(
    origins: NamadaExtensionApprovedOriginsType
  ): Promise<void> {
    await this.setRaw(this.getKey(NamadaExtensionApprovedOrigins), origins);
  }

  private getKey<S extends LocalStorageSchemas>(schema: S): LocalStorageKeys {
    const key = schemasMap.get(schema);
    if (!key) {
      throw new Error(`Could not find key for schema: ${schema}`);
    }

    return key;
  }
}
