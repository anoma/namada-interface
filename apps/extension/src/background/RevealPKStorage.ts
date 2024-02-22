import { KVStore } from "@namada/storage";
import * as E from "fp-ts/Either";
import * as t from "io-ts";

const PKs = t.array(t.string);
const schemas = [PKs];
type Schemas = (typeof schemas)[number];
type SchemasTypes = t.TypeOf<typeof PKs>;

const schemasMap = new Map<Schemas, string>([[PKs, "revealed-pk-store"]]);

export class RevealedPKStorage {
  constructor(private readonly provider: KVStore<SchemasTypes>) {}

  async getRevealedPKs(): Promise<string[] | undefined> {
    const data = await this.provider.get(schemasMap.get(PKs) as string);
    const decodedData = PKs.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Chain is not valid");
    }

    return decodedData.right;
  }

  async setRevealedPKs(publicKeys: string[]): Promise<void> {
    //TODO: encoed before set?
    //TODO: as string
    await this.provider.set(schemasMap.get(PKs) as string, publicKeys);
  }

  async addRevealedPK(publicKey: string): Promise<void> {
    const data = (await this.getRevealedPKs()) || [];
    if (!data.includes(publicKey)) {
      data.push(publicKey);
    }
    this.setRevealedPKs(data);
  }
}
