import { KVStore } from "@namada/storage";
import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { ExtStorage } from "./Storage";

const PKs = t.array(t.string);

type RevealPKSchemas = typeof PKs;

type SchemasTypes = t.TypeOf<typeof PKs>;

type RevealPKKeys = "revealed-pk-store";
const schemasMap = new Map<RevealPKSchemas, RevealPKKeys>([
  [PKs, "revealed-pk-store"],
]);

export class RevealedPKStorage extends ExtStorage {
  constructor(provider: KVStore<SchemasTypes>) {
    super(provider);
  }

  async getRevealedPKs(): Promise<string[] | undefined> {
    const data = await this.getRaw(this.getKey(PKs));
    const decodedData = PKs.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("RevealPK is not valid");
    }

    return decodedData.right;
  }

  async setRevealedPKs(publicKeys: string[]): Promise<void> {
    await this.setRaw(this.getKey(PKs), publicKeys);
  }

  async addRevealedPK(publicKey: string): Promise<void> {
    const data = (await this.getRevealedPKs()) || [];
    if (!data.includes(publicKey)) {
      data.push(publicKey);
    }
    this.setRevealedPKs(data);
  }

  private getKey<S extends RevealPKSchemas>(schema: S): RevealPKKeys {
    const key = schemasMap.get(schema);
    if (!key) {
      throw new Error(`Could not find key for schema: ${schema}`);
    }

    return key;
  }
}
