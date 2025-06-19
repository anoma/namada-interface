import { Sdk as SdkWasm } from "@namada/shared";

/**
 * Class representing utilities related to MASP
 */
export class Masp {
  /**
   * @param sdk - Instance of Sdk struct from wasm lib
   */
  constructor(protected readonly sdk: SdkWasm) {}

  /**
   * Get spend notes descriptor map
   * @async
   * @param tx - tx bytes
   * @param shieldedHash - bytes of the shielded hash
   * @returns - Promise resolving to an array of numbers representing the descriptor map
   */
  async getDescriptorMap(
    tx: Uint8Array,
    shieldedHash: Uint8Array
  ): Promise<number[]> {
    return await this.sdk.get_descriptor_map(tx, shieldedHash);
  }

  /**
   * Check if SDK has MASP parameters loaded
   * @async
   * @returns True if MASP parameters are loaded
   */
  async hasMaspParams(): Promise<boolean> {
    return await SdkWasm.has_masp_params();
  }

  /**
   * Fetch MASP parameters and store them in SDK
   * @async
   * @param [url] - optional URL to override the default
   * @returns void
   */
  async fetchAndStoreMaspParams(url?: string): Promise<void> {
    return await SdkWasm.fetch_and_store_masp_params(url);
  }

  /**
   * Load stored MASP params
   * @param pathOrDbName - Path to stored MASP params(nodejs) or name of the database(browser)
   * @param chainId - Chain ID to read the MASP params for
   * @async
   * @returns void
   */
  async loadMaspParams(pathOrDbName: string, chainId: string): Promise<void> {
    return await this.sdk.load_masp_params(pathOrDbName, chainId);
  }

  /**
   * Add spending key to SDK wallet
   * @async
   * @param xsk - extended spending key
   * @param alias - alias for the key
   * @returns void
   */
  async addSpendingKey(xsk: string, alias: string): Promise<void> {
    return await this.sdk.add_spending_key(xsk, alias);
  }

  /**
   * Add viewing key to SDK wallet
   * @async
   * @param xvk - extended viewing key
   * @param alias - alias for the key
   * @returns void
   */
  async addViewingKey(xvk: string, alias: string): Promise<void> {
    return await this.sdk.add_viewing_key(xvk, alias);
  }

  /**
   * Add payment address to SDK wallet
   * @async
   * @param xvk - Extended viewing key
   * @param alias - Alias for the key
   * @returns void
   */
  async addDefaultPaymentAddress(xvk: string, alias: string): Promise<void> {
    return await this.sdk.add_default_payment_address(xvk, alias);
  }

  /**
   * Returns the MASP address used as the receiving address in IBC transfers to
   * shielded accounts
   * @returns the MASP address
   */
  maspAddress(): string {
    return this.sdk.masp_address();
  }

  /**
   * Clear shilded context
   * @param chainId - Chain ID to clear the shielded context for
   * @returns void
   */
  clearShieldedContext(chainId: string): Promise<void> {
    return SdkWasm.clear_shielded_context(chainId);
  }
}
