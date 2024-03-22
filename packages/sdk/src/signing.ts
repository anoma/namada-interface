import { Sdk as SdkWasm } from "@namada/shared";

type Signature = [string, string];

/**
 * Non-Tx signing functions
 */
export class Signing {
  constructor(protected readonly sdk: SdkWasm) {}

  /**
   * Sign arbitrary data
   * @param {string} signingKey - private key
   * @param {string} data - data to sign
   * @returns {Signature} hash and signature
   */
  signArbitrary(signingKey: string, data: string): Signature {
    return this.sdk.sign_arbitrary(signingKey, data);
  }

  /**
   * Verify arbitrary signature. Will throw an error if the signature is invalid
   * @param {string} publicKey - public key to verify with
   * @param {string} hash - signed hash
   * @param {signature} signature - Hex-encoded signature
   * @returns {void}
   */
  verifyArbitrary(publicKey: string, hash: string, signature: string): void {
    return this.sdk.verify_arbitrary(publicKey, hash, signature);
  }
}
