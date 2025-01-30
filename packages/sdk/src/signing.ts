import { Sdk as SdkWasm } from "@namada/shared";
import { Message, TxMsgValue, TxProps } from "@namada/types";

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
   * @param txProps - TxProps
   * @param signingKey - private key(s)
   * @param [chainId] - optional chain ID, will enforce validation if present
   * @returns signed tx bytes - Promise resolving to Uint8Array
   */
  async sign(
    txProps: TxProps,
    signingKey: string | string[],
    chainId?: string
  ): Promise<Uint8Array> {
    const txMsgValue = new TxMsgValue(txProps);
    const msg = new Message<TxMsgValue>();
    const txBytes = msg.encode(txMsgValue);

    let signingKeys: string[] = [];
    if (signingKey instanceof Array) {
      signingKeys = signingKey;
    } else {
      signingKeys.push(signingKey);
    }

    return await this.sdk.sign_tx(txBytes, signingKeys, chainId);
  }

  /**
   * Sign masp spends
   * @param txProps - TxProps
   * @param xsks - spending keys
   * @returns tx with masp spends signed - Promise resolving to Uint8Array
   */
  async signMasp(txProps: TxProps, xsks: string[]): Promise<Uint8Array> {
    const txMsgValue = new TxMsgValue(txProps);
    const msg = new Message<TxMsgValue>();
    const txBytes = msg.encode(txMsgValue);

    return await this.sdk.sign_masp(xsks, txBytes);
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
