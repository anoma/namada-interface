import { BuiltTx } from "@namada/shared";

/**
 * Wrap results of tx building along with TxMsg
 */
export class EncodedTx {
  /**
   * Create an EncodedTx class
   * @param txMsg - Borsh-serialized transaction
   * @param tx - Specific tx struct instance
   */
  constructor(
    public readonly txMsg: Uint8Array,
    public readonly tx: BuiltTx
  ) {}

  /**
   * Return serialized tx bytes for external signing. This will clear
   * the BuiltTx struct instance from wasm memory, then return the bytes.
   * @returns Serialized tx bytes
   */
  toBytes(): Uint8Array {
    const bytes = new Uint8Array(this.tx.tx_bytes());
    this.free();
    return bytes;
  }

  /**
   * Return the inner Tx hash of the built Tx
   * @returns string of tx hash
   */
  hash(): string {
    return this.tx.tx_hash();
  }

  /**
   * Clear tx bytes resource
   */
  free(): void {
    this.tx.free();
  }
}

/**
 * Wrap results of tx signing to simplify passing between Sdk functions
 */
export class SignedTx {
  /**
   * @param txMsg - Serialized tx msg bytes
   * @param tx - Serialized tx bytes
   */
  constructor(
    // Serialized TxMsg
    public readonly txMsg: Uint8Array,
    // Built Tx
    public readonly tx: Uint8Array
  ) {}
}

export { TxType, TxTypeLabel } from "@namada/shared";
export type { SupportedTx } from "@namada/shared";
