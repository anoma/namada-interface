import { toHex } from "@cosmjs/encoding";
import { AnomaClient } from ".";
import { Keypair as NativeKeypair } from "lib/anoma";
import { hexToKeypair } from "utils/helpers";

class Keypair {
  private _bytes: Uint8Array = new Uint8Array();

  constructor(bytes?: Uint8Array) {
    if (bytes) {
      this._bytes = bytes;
    }
  }

  public async fromFile(file: File): Promise<Keypair> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        resolve(this.fromArrayBuffer(e.target?.result as ArrayBuffer));
      };

      reader.onerror = (err) => {
        reject(err);
      };

      reader.readAsArrayBuffer(new Blob([file]));
    });
  }

  public fromArrayBuffer(buffer: ArrayBuffer): Keypair {
    const bytes = new Uint8Array(buffer);
    return this.fromBytes(bytes);
  }

  public fromBytes(bytes: Uint8Array): Keypair {
    this._bytes = bytes;
    return this;
  }

  public toHex(): string {
    return this._bytes ? toHex(this._bytes) : "";
  }

  public async toNativeKeypair(): Promise<NativeKeypair> {
    const anoma = await new AnomaClient().init();
    const hex = this.toHex();
    return anoma?.keypair.deserialize(hexToKeypair(hex));
  }

  public get bytes(): Uint8Array {
    return this._bytes;
  }
}

export default Keypair;
