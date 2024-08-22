import { TxProps } from "@namada/types";

/**
 * Wrap results of tx building along with TxMsg
 */
export class EncodedTx {
  /**
   * Create an EncodedTx class
   * @param wrapperTxMsg - Borsh-serialized wrapper tx args
   * @param tx - Tx props
   */
  constructor(
    public readonly wrapperTxMsg: Uint8Array,
    public readonly tx: TxProps
  ) {}

  /**
   * Return serialized tx bytes for external signing. This will clear
   * the BuiltTx struct instance from wasm memory, then return the bytes.
   * @returns Serialized tx bytes
   */
  toBytes(): Uint8Array {
    const bytes = new Uint8Array(this.tx.bytes);
    return bytes;
  }

  /**
   * Return the inner Tx hash of the built Tx
   * @returns string of tx hash
   */
  hash(): string {
    return this.tx.hash;
  }
}

/**
 * Wrap results of tx signing to simplify passing between Sdk functions
 */
export class SignedTx {
  /**
   * @param wrapperTxMsg - Serialized wrapper tx msg bytes
   * @param tx - Serialized tx bytes
   */
  constructor(
    // Serialized WrapperTxMsg
    public readonly wrapperTxMsg: Uint8Array,
    // Built Tx
    public readonly tx: Uint8Array
  ) {}
}

export { BuiltTx, TxType, TxTypeLabel } from "@namada/shared";
export type { SupportedTx } from "@namada/shared";
