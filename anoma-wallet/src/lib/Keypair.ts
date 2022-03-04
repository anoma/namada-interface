import { fromHex, toHex } from "@cosmjs/encoding";
import { AnomaClient } from ".";
import { Keypair as NativeKeypair } from "lib/anoma";

class Keypair {
  private _bytes: Uint8Array = new Uint8Array();

  constructor(bytes?: Uint8Array) {
    if (bytes) {
      this._bytes = bytes;
    }
  }

  /**
   * Get instance of class from ArrayBuffer
   */
  public fromArrayBuffer(buffer: ArrayBuffer): Keypair {
    const bytes = new Uint8Array(buffer);
    return this.fromBytes(bytes);
  }

  /**
   * Get instance of class from bytes
   */
  public fromBytes(bytes: Uint8Array): Keypair {
    this._bytes = bytes;
    return this;
  }

  /**
   *
   * Convert bytes to hex
   */
  public toHex(): string {
    return this._bytes ? toHex(this._bytes) : "";
  }

  /**
   *
   * Convert to native Anoma keypair
   */
  public async toNativeKeypair(): Promise<NativeKeypair> {
    const anoma = await new AnomaClient().init();
    const hex = this.toHex();
    return anoma?.keypair.deserialize(this.hexToKeypair(hex));
  }

  /**
   * Convert a hex keypair to a serializable keypair object
   */
  public hexToKeypair(keypair: string): {
    secret: Uint8Array;
    public: Uint8Array;
  } {
    // TODO: This will be deprecated
    // This structure is only relevant to how keys are exported
    // from Anoma Wallet CLI, and should not be relied on.
    const [, priv, pub] = keypair.split("20000000");
    return {
      secret: fromHex(priv),
      public: fromHex(pub),
    };
  }

  /**
   * Get bytes
   */
  public get bytes(): Uint8Array {
    return this._bytes;
  }
}

export default Keypair;
