import { BuiltTx } from "@namada/shared";

/**
 * Wrap results of tx building along with TxMsg
 */
export class EncodedTx {
  constructor(
    // Serialized TxMsg
    public readonly txMsg: Uint8Array,
    // Built Tx
    public readonly tx: BuiltTx
  ) {}

  // Return serialized tx bytes for external signing
  toBytes(): Uint8Array {
    const bytes = new Uint8Array(this.tx.tx_bytes());
    this.free();
    return bytes;
  }

  // Clear tx bytes resource
  free(): void {
    this.tx.free();
  }
}

/**
 * Wrap results of tx signing to simplify passing between Sdk functions
 */
export class SignedTx {
  constructor(
    // Serialized TxMsg
    public readonly txMsg: Uint8Array,
    // Built Tx
    public readonly tx: Uint8Array
  ) {}
}
