import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { Vault as VaultV1 } from "./VaultSchemaV1";
import {
  KeyStore as KeyStoreV2,
  Sensitive as SensitiveV2,
  Vault as VaultV2,
} from "./VaultSchemaV2";
import { migrations } from "./migrations";

type VaultV1Type = t.TypeOf<typeof VaultV1>;
type VaultV2Type = t.TypeOf<typeof VaultV2>;
type Versions = VaultV1Type | VaultV2Type;

// We need to define the schemas in reverse order, more below
const schemas = [VaultV2, VaultV1];

const current = (data: unknown): [Versions, number] => {
  // We check in reverse order as io-ts ignores extra fields,
  // this means that for example if in version 2 we only added a new field
  // version 1 will still be able to decode the data.
  // Also if version 1 schema uses t.exact it will strip the extra fields
  // and then "v1v2" migration will replace them with default values.
  for (let i = 0; i < schemas.length; i++) {
    const schema = schemas[i];
    const decodedData = schema.decode(data);

    if (E.isRight(decodedData)) {
      return [decodedData.right, i];
    }
  }

  throw new Error("Can't decode current vault data");
};

export const Vault = VaultV2;
export const KeyStore = KeyStoreV2;
export type VaultType = VaultV2Type;
export type SensitiveType = t.TypeOf<typeof SensitiveV2>;
export type KeyStoreType = t.TypeOf<typeof KeyStoreV2>;

export const migrateVault = (data: unknown): VaultType => {
  const [currentData, index] = current(data);
  // We subtract the index from the length as migrations are specified
  // in the order from v1 to vX and schemas are reversed
  const ms = migrations.slice(migrations.length - index);

  return ms.reduce(
    (acc, migration) => migration(acc),
    currentData
  ) as VaultType;
};
