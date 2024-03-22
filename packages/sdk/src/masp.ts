import { Sdk as SdkWasm } from "@namada/shared";

/**
 * Class representing utilities related to MASP
 */
export class Masp {
  /**
   * @param {SdkWasm} sdk - Instance of Sdk struct from wasm lib
   */
  constructor(protected readonly sdk: SdkWasm) {}

  /**
   * Check if SDK has MASP parameters loaded
   * @async
   * @returns {Promise<boolean>} True if MASP parameters are loaded
   */
  async hasMaspParams(): Promise<boolean> {
    return await SdkWasm.has_masp_params();
  }

  /**
   * Fetch MASP parameters and store them in SDK
   * @async
   * @returns {void}
   */
  async fetchAndStoreMaspParams(): Promise<void> {
    return await SdkWasm.fetch_and_store_masp_params();
  }

  /**
   * Load stored MASP params
   * @async
   * @returns {void}
   */
  async loadMaspParams(): Promise<void> {
    return await this.sdk.load_masp_params();
  }

  /**
   * Add spending key to SDK wallet
   * @async
   * @param {string} xsk - extended spending key
   * @param {string} alias - alias for the key
   * @returns {Promise<void>}
   */
  async addSpendingKey(xsk: string, alias: string): Promise<void> {
    return await this.sdk.add_spending_key(xsk, alias);
  }
}
