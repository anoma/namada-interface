import Transport from "@ledgerhq/hw-transport";
import { init as initCrypto } from "@namada/crypto/src/init";
import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { init as initShared } from "@namada/shared/src/init";
import { Keys } from "keys";
import { Ledger } from "ledger";
import { Mnemonic } from "mnemonic";
import { Rpc } from "rpc";
import { Signing } from "signing";
import { Tx } from "tx";

/**
 * API for interacting with Namada SDK
 */
export class Sdk {
  /**
   * @param {SdkWasm} sdk - Instance of Sdk struct from wasm lib
   * @param {QueryWasm} query - Instance of Query struct from wasm lib
   * @param {WebAssembly.Memory} cryptoMemory - Memory accessor for crypto lib
   * @param {string} url - RPC url
   * @param {string} nativeToken - Address of chain's native token
   */
  constructor(
    protected readonly sdk: SdkWasm,
    protected readonly query: QueryWasm,
    protected readonly cryptoMemory: WebAssembly.Memory,
    public readonly url: string,
    public readonly nativeToken: string
  ) {}

  /**
   * Returns an initialized Sdk class
   * @async
   * @param {string} url - RPC url for use with SDK
   * @param {string} [token] - Native token of the target chain, if not provided, an attempt to query it will be made
   * @return {Sdk} Instance of initialized Sdk class
   */
  async init(url: string, token?: string): Promise<Sdk> {
    // Load and initialize shared wasm
    const sharedWasm = await fetch("shared.namada.wasm").then((wasm) =>
      wasm.arrayBuffer()
    );
    await initShared(sharedWasm);

    // Load and initialize crypto wasm
    const cryptoWasm = await fetch("crypto.namada.wasm").then((wasm) =>
      wasm.arrayBuffer()
    );
    const { memory: cryptoMemory } = await initCrypto(cryptoWasm);

    // Instantiate QueryWasm
    const query = new QueryWasm(url);

    let nativeToken: string = "";

    // Token not provided, make an attempt to query it
    if (!token) {
      try {
        const result = await query.query_native_token();
        nativeToken = result;
      } catch (e) {
        // Raise exception if query is required but native token cannot be determined
        throw new Error(`Unable to Query native token! ${e}`);
      }
    }

    // Instantiate SdkWasm
    const sdk = new SdkWasm(url, nativeToken);
    return new Sdk(sdk, query, cryptoMemory, url, nativeToken);
  }

  /**
   * Return initialized Rpc class
   * @return {Rpc} Namada RPC client
   */
  getRpc(): Rpc {
    return new Rpc(this.sdk, this.query);
  }

  /**
   * Return initialized Tx class
   * @return {Tx} Tx-related functionality
   */
  getTx(): Tx {
    return new Tx(this.sdk);
  }

  /**
   * Return initialized Mnemonic class
   * @return {Mnemonic}
   */
  getMnemonic(): Mnemonic {
    return new Mnemonic(this.cryptoMemory);
  }

  /**
   * Return initialized Keys class
   * @return {Keys}
   */
  getKeys(): Keys {
    return new Keys(this.cryptoMemory);
  }

  /**
   * Return initialized Signing class
   * @return {Signing} Non-Tx signing functionality
   */
  getSigning(): Signing {
    return new Signing(this.sdk);
  }

  /**
   * Intialize Ledger class for use with NamadaApp
   * @async
   * @param {Transport} [transport] - Will default to USB transport if not specified
   * @return {Ledger} Class for interacting with NamadaApp for Ledger Hardware Wallets
   */
  async initLedger(transport?: Transport): Promise<Ledger> {
    return await Ledger.init(transport);
  }

  /**
   * Define rpc getter to use with destructuring assignment
   * @return {Rpc}
   */
  get rpc(): Rpc {
    return this.getRpc();
  }

  /**
   * Define tx getter to use with destructuring assignment
   * @return {Tx}
   */
  get tx(): Tx {
    return this.getTx();
  }

  /**
   * Define mnemonic getter to use with destructuring assignment
   * @return {Mnemonic}
   */
  get mnemonic(): Mnemonic {
    return this.getMnemonic();
  }

  /**
   * Define keys getter to use with destructuring assignment
   * @return {Keys}
   */
  get keys(): Keys {
    return this.getKeys();
  }

  /**
   * Define signing getter to use with destructuring assignment
   * @return {Signing}
   */
  get signing(): Signing {
    return this.getSigning();
  }
}
