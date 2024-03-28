import { Sdk as SdkWasm } from "@namada/shared";

/**
 * Class representing utilities related to Wallet
 */
export class Wallet {
  /**
   * @param sdk - Instance of Sdk struct from wasm lib
   */
  constructor(protected readonly sdk: SdkWasm) {}

  /**
   * Load wallet from storage
   * @async
   * @returns void
   */
  async saveWallet(): Promise<void> {
    return await this.sdk.save_wallet();
  }

  /**
   * Load wallet from storage
   * @async
   * @returns void
   */
  async loadWallet(): Promise<void> {
    return await this.sdk.load_wallet();
  }

  /**
   * Add keypair to the wallet
   * @async
   * @param secretKey - Serialized namada secret key
   * @param alias - Alias for the key
   * @param [password] - Optional password to encrypt the secret key
   * @returns void
   */
  async addKeypair(
    secretKey: string,
    alias: string,
    password?: string
  ): Promise<void> {
    return await this.sdk.add_keypair(secretKey, alias, password);
  }
}
