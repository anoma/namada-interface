import { AnomaClient } from ".";
import { Keypair as NativeKeypair } from "lib/anoma";
import { fromHex } from "@cosmjs/encoding";

type KeypairArgs = {
  public: string;
  private: string;
};

export type SerializableKeypair = {
  public: Uint8Array;
  secret: Uint8Array;
};

class Keypair {
  private _public: Uint8Array;
  private _private: Uint8Array;

  constructor(args: KeypairArgs) {
    this._public = fromHex(args.public);
    this._private = fromHex(args.private);
  }

  public get serializable(): SerializableKeypair {
    return {
      public: this._public,
      secret: this._private,
    };
  }

  /**
   * Convert to native Anoma keypair
   */
  public async toNativeKeypair(): Promise<NativeKeypair> {
    const { keypair } = await new AnomaClient().init();
    return keypair.deserialize({
      public: this._public,
      secret: this._private,
    });
  }
}

export default Keypair;
