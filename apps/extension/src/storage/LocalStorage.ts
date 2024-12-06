import { chains } from "@namada/chains";
import { KVStore } from "@namada/storage";
import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { ExtStorage } from "./Storage";

const ChainId = t.string;
type ChainIdType = t.TypeOf<typeof ChainId>;

const NamadaExtensionApprovedOrigins = t.array(t.string);
type NamadaExtensionApprovedOriginsType = t.TypeOf<
  typeof NamadaExtensionApprovedOrigins
>;

const NamadaExtensionRouterId = t.number;
type NamadaExtensionRouterIdType = t.TypeOf<typeof NamadaExtensionRouterId>;

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
type LocalStorageTypes =
  | ChainIdType
  | NamadaExtensionApprovedOriginsType
  | NamadaExtensionRouterIdType
  | NamadaKeychainPermissionsType;

type LocalStorageSchemas =
  | typeof ChainId
  | typeof NamadaExtensionApprovedOrigins
  | typeof NamadaExtensionRouterId
  | typeof NamadaKeychainPermissions;

export type LocalStorageKeys =
  | "chainId"
  | "namadaExtensionApprovedOrigins"
  | "namadaExtensionRouterId"
  | "namadaKeychainPermissions"
  | "tabs";

const schemasMap = new Map<LocalStorageSchemas, LocalStorageKeys>([
  [ChainId, "chainId"],
  [NamadaExtensionApprovedOrigins, "namadaExtensionApprovedOrigins"],
  [NamadaExtensionRouterId, "namadaExtensionRouterId"],
  [NamadaKeychainPermissions, "namadaKeychainPermissions"],
]);

export class LocalStorage extends ExtStorage {
  constructor(provider: KVStore<LocalStorageTypes>) {
    super(provider);
  }

  async getChainId(): Promise<ChainIdType | undefined> {
    const data = await this.getRaw(this.getKey(ChainId));

    const Schema = t.union([ChainId, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      // Return default chainId if invalid. Validation should not prevent this from
      // returning a value
      return chains.namada.chainId;
    }

    return decodedData.right;
  }

  async setChainId(chainId: ChainIdType): Promise<void> {
    await this.setRaw(this.getKey(ChainId), chainId);
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
    await this.setApprovedOrigins([...data, originToAdd]);
  }

  async removeApprovedOrigin(originToRemove: string): Promise<void> {
    const data = (await this.getApprovedOrigins()) || [];
    await this.setApprovedOrigins(
      data.filter((origin) => origin !== originToRemove)
    );
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
      return;
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
