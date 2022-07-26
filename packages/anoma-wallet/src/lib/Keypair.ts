import { fromHex } from "@cosmjs/encoding";
import { AnomaClient, Keypair as NativeKeypair } from "@namada-interface/anoma-lib";

type KeypairArgs = {
  public: string;
  secret: string;
};

export type SerializableKeypair = {
  public: Uint8Array;
  secret: Uint8Array;
};

class Keypair {
  private _public: string;
  private _secret: string;

  constructor(args: KeypairArgs) {
    this._public = args.public;
    this._secret = args.secret;
  }

  public get serializable(): SerializableKeypair {
    return {
      public: fromHex(this._public),
      secret: fromHex(this._secret),
    };
  }

  /**
   * Convert to native Anoma keypair
   */
  public async toNativeKeypair(): Promise<NativeKeypair> {
    const { keypair } = await new AnomaClient().init();
    return keypair.from_js_value_to_pointer(this.serializable);
  }
}

export default Keypair;
