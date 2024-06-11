import { BatchTx, BuiltTx, Sdk as SdkWasm } from "@namada/shared";

type Signature = [string, string];

/**
 * Non-Tx signing functions
 */
export class Signing {
  /**
   * Signing constructor
   * @param sdk - Instance of Sdk struct from wasm lib
   */
  constructor(protected readonly sdk: SdkWasm) {}

  /**
   * Sign Namada transaction
   * @param builtTx - BuiltTx instance
   * @param signingKey - private key
   * @param [chainId] - optional chain ID, will enforce validation if present
   * @returns signed tx bytes - Promise resolving to Uint8Array
   */
  async sign(
    builtTx: BuiltTx,
    signingKey: string,
    chainId?: string
  ): Promise<Uint8Array> {
    return await this.sdk.sign_tx(builtTx, signingKey, chainId);
  }

  /**
   * Sign Namada batched transaction
   * @param batchTx - BatchTx instance
   * @param signingKey - private key
   * @param [chainId] - optional chain ID, will enforce validation if present
   * @returns signed tx bytes - Promise resolving to Uint8Array
   */
  async signBatch(
    batchTx: BatchTx,
    signingKey: string,
    chainId?: string
  ): Promise<Uint8Array> {
    return await this.sdk.sign_batch(batchTx, signingKey, chainId);
  }

  /**
   * Sign arbitrary data
   * @param signingKey - private key
   * @param data - data to sign
   * @returns hash and signature
   */
  signArbitrary(signingKey: string, data: string): Signature {
    return this.sdk.sign_arbitrary(signingKey, data);
  }

  /**
   * Verify arbitrary signature. Will throw an error if the signature is invalid
   * @param publicKey - public key to verify with
   * @param hash - signed hash
   * @param signature - Hex-encoded signature
   * @returns void
   */
  verifyArbitrary(publicKey: string, hash: string, signature: string): void {
    return this.sdk.verify_arbitrary(publicKey, hash, signature);
  }
}
