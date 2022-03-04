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
  private _public: string;
  private _private: string;

  constructor(args: KeypairArgs) {
    this._public = args.public;
    this._private = args.private;
  }

  public toSerializable(): SerializableKeypair {
    return {
      public: fromHex(this._public),
      secret: fromHex(this._private),
    };
  }
  /**
   *
   * Convert to native Anoma keypair
   */
  public static async toNativeKeypair(
    serializableKeypair: SerializableKeypair
  ): Promise<NativeKeypair> {
    const { keypair } = await new AnomaClient().init();
    return keypair.deserialize(serializableKeypair);
  }
}

export default Keypair;
