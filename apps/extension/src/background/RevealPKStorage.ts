import { KVStore } from "@namada/storage";
import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { ExtStorage } from "./Storage";

const PKs = t.array(t.string);
const schemas = [PKs];
type Schemas = (typeof schemas)[number];
type SchemasTypes = t.TypeOf<typeof PKs>;

const keys = ["revealed-pk-store"];
type Keys = (typeof keys)[number];

const schemasMap = new Map<Schemas, string>([[PKs, "revealed-pk-store"]]);

export class RevealedPKStorage extends ExtStorage {
  constructor(provider: KVStore<SchemasTypes>) {
    super(provider);
  }

  async getRevealedPKs(): Promise<string[] | undefined> {
    const data = await this.getRaw(this.getKey(PKs));
    const decodedData = PKs.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Chain is not valid");
    }

    return decodedData.right;
  }

  async setRevealedPKs(publicKeys: string[]): Promise<void> {
    //TODO: encoed before set?
    await this.setRaw(this.getKey(PKs), publicKeys);
  }

  async addRevealedPK(publicKey: string): Promise<void> {
    const data = (await this.getRevealedPKs()) || [];
    if (!data.includes(publicKey)) {
      data.push(publicKey);
    }
    this.setRevealedPKs(data);
  }

  private getKey<S extends Schemas>(schema: S): Keys {
    const key = schemasMap.get(schema);
    if (!key) {
      throw new Error(`Could not find key for schema: ${schema}`);
    }

    return key;
  }
}
