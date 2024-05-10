import { Sdk as SdkWasm } from "@namada/shared";

type Signature = [string, string];

/**
 * Non-Tx signing functions
 */
export class Signing {
  /**
   * Signing constructor
   * @param sdk - Instance of Sdk struct from wasm lib
   */
  constructor(protected readonly sdk: SdkWasm) { }

  /**
   * Sign Namada transaction
   * @param txBytes - Tx bytes for signing
   * @param signingDataBytes - SigningTxData bytes for signing
   * @param chainId - chainId
   * @param signingKey - private key
   * @returns signed tx bytes - Promise resolving to Uint8Array
   */
  async sign(
    txBytes: Uint8Array,
    signingDataBytes: Uint8Array,
    chainId: string,
    signingKey: string
  ): Promise<Uint8Array> {
    return await this.sdk.sign_tx(
      txBytes,
      signingDataBytes,
      chainId,
      signingKey
    );
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
