import { AccountEntity } from "entities";
import * as t from "io-ts";
import { PrimitiveType, Vault, VaultService } from "../../background/vault";
import { KEYSTORE_KEY } from "./keyring";

const schemas = [AccountEntity];
type Schemas = (typeof schemas)[number];
const schemasMap = new Map<Schemas, string>([[AccountEntity, KEYSTORE_KEY]]);

type ValueTypeByKey<T, K extends keyof T> = T[K];

export class KeyringVaultService {
  constructor(private readonly vaultService: VaultService) {}

  public async findOne<P extends Schemas>(
    schema: P,
    prop?: keyof t.TypeOf<ValueTypeByKey<P, "schema">>,
    value?: PrimitiveType
  ): Promise<Vault<t.TypeOf<ValueTypeByKey<P, "schema">>> | null> {
    const key = schemasMap.get(schema);
    //TODO: figure out if we want to throw an error here or return null
    if (!key) {
      throw new Error("Couldn't find the key for the schema");
    }
    const result = await this.vaultService.findOne(key, prop, value);
    if (!result) {
      return null;
    }
    const publicData = schema.migration(result?.public);

    return publicData ? { ...result, public: publicData } : null;
  }

  // public async findAll<P extends Schemas>(
  //   key: string,
  //   prop?: keyof P,
  //   value?: PrimitiveType
  // ): Promise<Vault<P>[]> {
  //   return await this.find<P>(key, prop, value);
  // }

  // public async findAllOrFail<P>(
  //   key: string,
  //   prop?: keyof P,
  //   value?: PrimitiveType
  // ): Promise<Vault<P>[]> {
  //   const result = await this.findAll<P>(key, prop, value);
  //   if (result.length === 0) {
  //     throw new Error("No results have been found on Vault");
  //   }
  //   return result;
  // }

  // public async findOneOrFail<P>(
  //   key: string,
  //   prop?: keyof P,
  //   value?: PrimitiveType
  // ): Promise<Vault<P>> {
  //   const result = await this.find<P>(key, prop, value);
  //   if (result.length === 0) {
  //     throw new Error("No results have been found on Vault");
  //   }
  //   return result[0];
  // }
}
