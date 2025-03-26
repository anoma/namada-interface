import * as t from "io-ts";
import { Vault as VaultV1 } from "./VaultSchemaV1";
import {
  KeyStore as KeyStoreV2,
  Sensitive as SensitiveV2,
  Vault as VaultV2,
} from "./VaultSchemaV2";
import { v1toV2 } from "./migrations";

type VaultV1Type = t.TypeOf<typeof VaultV1>;
type VaultV2Type = t.TypeOf<typeof VaultV2>;
type Versions = VaultV1Type | VaultV2Type;

const isVaultV1 = (data: unknown): data is VaultV1Type => VaultV1.is(data);
const isVaultV2 = (data: unknown): data is VaultV2Type => VaultV2.is(data);

export const Vault = VaultV2;
export const KeyStore = KeyStoreV2;
export type VaultType = VaultV2Type;
export type SensitiveType = t.TypeOf<typeof SensitiveV2>;
export type KeyStoreType = t.TypeOf<typeof KeyStoreV2>;

export const migrateVault = (data: unknown): VaultType => {
  const migrate = (data: Versions): Versions => {
    // We check in reverse order as io-ts ignores extra fields,
    // this means that for example if in version 2 we only added a new field
    // version 1 will still be able to decode the data.
    // Also if version 1 schema uses t.exact it will strip the extra fields
    // and then "v1v2" migration will replace them with default values.
    if (isVaultV2(data)) {
      return data;
    } else if (isVaultV1(data)) {
      return migrate(v1toV2(data));
    }

    throw new Error("Can't migrate vault data");
  };

  // It's fine to cast here as data will be checked against schemas
  return migrate(data as Versions) as VaultType;
};
