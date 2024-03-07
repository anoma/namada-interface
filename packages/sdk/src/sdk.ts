import Transport from "@ledgerhq/hw-transport";
import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { Keys } from "./keys";
import { Ledger } from "./ledger";
import { Masp } from "./masp";
import { Mnemonic } from "./mnemonic";
import { Rpc } from "./rpc";
import { Signing } from "./signing";
import { Tx } from "./tx";

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
   * Return initialized Rpc class
   * @returns {Rpc} Namada RPC client
   */
  getRpc(): Rpc {
    return new Rpc(this.sdk, this.query);
  }

  /**
   * Return initialized Tx class
   * @returns {Tx} Tx-related functionality
   */
  getTx(): Tx {
    return new Tx(this.sdk);
  }

  /**
   * Return initialized Mnemonic class
   * @returns {Mnemonic} mnemonic-related functionality
   */
  getMnemonic(): Mnemonic {
    return new Mnemonic(this.cryptoMemory);
  }

  /**
   * Return initialized Keys class
   * @returns {Keys} key-related functionality
   */
  getKeys(): Keys {
    return new Keys(this.cryptoMemory);
  }

  /**
   * Return initialized Signing class
   * @returns {Signing} Non-Tx signing functionality
   */
  getSigning(): Signing {
    return new Signing(this.sdk);
  }

  /**
   * Return initialized Masp class
   * @returns {Masp} Masp utilities for handling params
   */
  getMasp(): Masp {
    return new Masp(this.sdk);
  }

  /**
   * Intialize Ledger class for use with NamadaApp
   * @async
   * @param {Transport} [transport] - Will default to USB transport if not specified
   * @returns {Ledger} Class for interacting with NamadaApp for Ledger Hardware Wallets
   */
  async initLedger(transport?: Transport): Promise<Ledger> {
    return await Ledger.init(transport);
  }

  /**
   * Define rpc getter to use with destructuring assignment
   * @returns {Rpc} rpc client
   */
  get rpc(): Rpc {
    return this.getRpc();
  }

  /**
   * Define tx getter to use with destructuring assignment
   * @returns {Tx} tx-related functionality
   */
  get tx(): Tx {
    return this.getTx();
  }

  /**
   * Define mnemonic getter to use with destructuring assignment
   * @returns {Mnemonic} mnemonic-related functionality
   */
  get mnemonic(): Mnemonic {
    return this.getMnemonic();
  }

  /**
   * Define keys getter to use with destructuring assignment
   * @returns {Keys} key-related functionality
   */
  get keys(): Keys {
    return this.getKeys();
  }

  /**
   * Define signing getter to use with destructuring assignment
   * @returns {Signing} Non-Tx signing functionality
   */
  get signing(): Signing {
    return this.getSigning();
  }

  /**
   * Define signing getter to use with destructuring assignment
   * @returns {Masp} Masp utilities for handling params
   */
  get masp(): Masp {
    return this.getMasp();
  }
}
