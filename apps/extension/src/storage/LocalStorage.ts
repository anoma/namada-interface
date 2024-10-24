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

export type PermissionKind = "accounts" | "signing" | "proofGenKeys";

export const KeychainPermissions: Record<
  PermissionKind,
  { description: string }
> = {
  accounts: {
    description: "Allow approved clients to read account public data",
  },
  signing: { description: "Allow approved clients to sign transactions" },
  proofGenKeys: {
    description:
      "Allow approved clients to request proof generation keys for shielded accounts",
  },
};
export type AllowedPermissions = (keyof typeof KeychainPermissions)[];

// Define keychain permissions schema
const PermissionDomain = t.string;
const PermissionChainId = t.string;
const NamadaKeychainPermissions = t.record(
  PermissionDomain,
  t.record(PermissionChainId, t.array(t.keyof(KeychainPermissions)))
);

// Export keychain permissions type
export type NamadaKeychainPermissionsType = t.TypeOf<
  typeof NamadaKeychainPermissions
>;

const NamadaExtensionRouterId = t.number;
type NamadaExtensionRouterIdType = t.TypeOf<typeof NamadaExtensionRouterId>;

type LocalStorageTypes =
  | ChainType
  | NamadaKeychainPermissionsType
  | NamadaExtensionRouterIdType;

type LocalStorageSchemas =
  | typeof Chain
  | typeof NamadaExtensionRouterId
  | typeof NamadaKeychainPermissions;

export type LocalStorageKeys =
  | "chains"
  | "namadaExtensionApprovedOrigins"
  | "namadaExtensionRouterId"
  | "namadaKeychainPermissions"
  | "tabs";

const schemasMap = new Map<LocalStorageSchemas, LocalStorageKeys>([
  [Chain, "chains"],
  [NamadaExtensionRouterId, "namadaExtensionRouterId"],
  [NamadaKeychainPermissions, "namadaKeychainPermissions"],
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

  async getPermissions(): Promise<NamadaKeychainPermissionsType | undefined> {
    const data = await this.getRaw(this.getKey(NamadaKeychainPermissions));
    const Schema = t.union([NamadaKeychainPermissions, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("");
    }
    return decodedData.right;
  }

  async setPermissions(
    permissions: NamadaKeychainPermissionsType
  ): Promise<void> {
    // Validate permissions against schema
    const Schema = t.union([NamadaKeychainPermissions, t.undefined]);
    const decodedData = Schema.decode(permissions);

    if (E.isLeft(decodedData)) {
      throw new Error("Invalid permissions data!");
    }

    await this.setRaw(
      this.getKey(NamadaKeychainPermissions),
      decodedData.right
    );
  }

  async getApprovedOrigins(): Promise<string[] | undefined> {
    const data = await this.getRaw(this.getKey(NamadaKeychainPermissions));

    const Schema = t.union([NamadaKeychainPermissions, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Stored Keychain permissions are not valid!");
    }

    return Object.keys(decodedData.right || {});
  }

  private getKey<S extends LocalStorageSchemas>(schema: S): LocalStorageKeys {
    const key = schemasMap.get(schema);
    if (!key) {
      throw new Error(`Could not find key for schema: ${schema}`);
    }

    return key;
  }
}
