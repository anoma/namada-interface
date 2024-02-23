import { Sdk as SdkWasm } from "@namada/shared";
import { SignatureResponse } from "@namada/types";

/**
 * Non-Tx signing functions
 */
export class Signing {
  constructor(protected readonly sdk: SdkWasm) {}

  /**
   * Sign arbitrary data
   * @param {string} signingKey
   * @param {string} data
   * @return {SignatureResponse}
   */
  signArbitrary(signingKey: string, data: string): SignatureResponse {
    return this.sdk.sign_arbitrary(signingKey, data);
  }

  /**
   * Verify arbitrary signature. Will throw an error if the signature is invalid
   * @param {string} publicKey
   * @param {string} hash - signed hash
   * @param {signature} signature - Hex-encoded signature
   * @returns {void}
   */
  verifyArbitrary(publicKey: string, hash: string, signature: string): void {
    return this.sdk.verify_arbitrary(publicKey, hash, signature);
  }
}
