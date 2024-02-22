import { KVStore } from "@namada/storage";
import * as E from "fp-ts/Either";
import * as t from "io-ts";

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

type SchemasTypes =
  | ChainType
  | NamadaExtensionApprovedOriginsType
  | NamadaExtensionRouterIdType
  | TabsType;

const schemas = [
  Chain,
  NamadaExtensionApprovedOrigins,
  NamadaExtensionRouterId,
  Tabs,
];
type Schemas = (typeof schemas)[number];

const schemasMap = new Map<Schemas, string>([
  [Chain, "chains"],
  [NamadaExtensionApprovedOrigins, "namadaExtensionApprovedOrigins"],
  [NamadaExtensionRouterId, "namadaExtensionRouterId"],
  [Tabs, "tabs"],
]);

export class LocalStorage {
  constructor(private readonly provider: KVStore<SchemasTypes>) {}

  async getChain(): Promise<ChainType | undefined> {
    //TODO: as string
    const data = await this.provider.get(schemasMap.get(Chain) as string);
    const decodedData = Chain.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Chain is not valid");
    }

    return decodedData.right;
  }

  async setChain(chain: ChainType): Promise<void> {
    //TODO: encoed before set?
    //TODO: as string
    await this.provider.set(schemasMap.get(Chain) as string, chain);
  }

  async getApprovedOrigins(): Promise<
    NamadaExtensionApprovedOriginsType | undefined
  > {
    //TODO: as string
    const data = await this.provider.get(
      schemasMap.get(NamadaExtensionApprovedOrigins) as string
    );
    const decodedData = NamadaExtensionApprovedOrigins.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Chain is not valid");
    }

    return decodedData.right;
  }

  async setApprovedOrigins(
    origins: NamadaExtensionApprovedOriginsType
  ): Promise<void> {
    //TODO: encoed before set?
    //TODO: as string
    await this.provider.set(
      schemasMap.get(NamadaExtensionApprovedOrigins) as string,
      origins
    );
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
    //TODO: as string
    const data = await this.provider.get(
      schemasMap.get(NamadaExtensionRouterId) as string
    );
    const decodedData = NamadaExtensionRouterId.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Chain is not valid");
    }

    return decodedData.right;
  }

  async setRouterId(id: NamadaExtensionRouterIdType): Promise<void> {
    //TODO: encoed before set?
    //TODO: as string
    await this.provider.set(
      schemasMap.get(NamadaExtensionRouterId) as string,
      id
    );
  }

  async getTabs(): Promise<TabsType | undefined> {
    //TODO: as string
    const data = await this.provider.get(schemasMap.get(Tabs) as string);
    const decodedData = Tabs.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Chain is not valid");
    }

    return decodedData.right;
  }

  async setTabs(tabs: TabsType): Promise<void> {
    await this.provider.set(schemasMap.get(Tabs) as string, tabs);
  }
}
