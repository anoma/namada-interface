import Transport from "@ledgerhq/hw-transport";
import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import packageJson from "../package.json";
import { Crypto } from "./crypto";
import { Keys } from "./keys";
import { Ledger } from "./ledger";
import { Masp } from "./masp";
import { Mnemonic } from "./mnemonic";
import { Rpc } from "./rpc";
import { Signing } from "./signing";
import { Tx } from "./tx";

export { ProgressBarNames, SdkEvents } from "@namada/shared";

/**
 * API for interacting with Namada SDK
 */
export class Sdk {
  /**
   * @param sdk - Instance of Sdk struct from wasm lib
   * @param query - Instance of Query struct from wasm lib
   * @param cryptoMemory - Memory accessor for crypto lib
   * @param url - RPC url
   * @param nativeToken - Address of chain's native token
   */
  constructor(
    protected sdk: SdkWasm,
    protected query: QueryWasm,
    public readonly cryptoMemory: WebAssembly.Memory,
    public readonly url: string,
    public readonly nativeToken: string
  ) {}

  /**
   * Re-initialize wasm instances and return this instance
   * @param url - RPC url
   * @param [nativeToken] - Address of chain's native token
   * @returns this instance of Sdk
   */
  updateNetwork(url: string, nativeToken?: string): Sdk {
    const query = new QueryWasm(url);
    this.query = query;

    // Update nativeToken as well if provided
    const sdk = new SdkWasm(url, nativeToken || this.nativeToken, "");
    this.sdk = sdk;

    return this;
  }

  /**
   * Return initialized Rpc class
   * @returns Namada RPC client
   */
  getRpc(): Rpc {
    return new Rpc(this.sdk, this.query);
  }

  /**
   * Return initialized Tx class
   * @returns Tx-related functionality
   */
  getTx(): Tx {
    return new Tx(this.sdk);
  }

  /**
   * Return initialized Mnemonic class
   * @returns mnemonic-related functionality
   */
  getMnemonic(): Mnemonic {
    return new Mnemonic(this.cryptoMemory);
  }

  /**
   * Return initialized Keys class
   * @returns key-related functionality
   */
  getKeys(): Keys {
    return new Keys(this.cryptoMemory);
  }

  /**
   * Return initialized Signing class
   * @returns Non-Tx signing functionality
   */
  getSigning(): Signing {
    return new Signing(this.sdk);
  }

  /**
   * Return initialized Masp class
   * @returns Masp utilities for handling params
   */
  getMasp(): Masp {
    return new Masp(this.sdk);
  }

  /**
   * Return initialized Crypto class
   * @returns Utilities for encrypting and decrypting data
   */
  getCrypto(): Crypto {
    return new Crypto(this.cryptoMemory);
  }

  /**
   * Intialize Ledger class for use with NamadaApp
   * @async
   * @param [transport] - Will default to USB transport if not specified
   * @returns Class for interacting with NamadaApp for Ledger Hardware Wallets
   */
  async initLedger(transport?: Transport): Promise<Ledger> {
    return await Ledger.init(transport);
  }

  /**
   * Return SDK Package version
   * @returns SDK version
   */
  getVersion(): string {
    return packageJson.version;
  }

  /**
   * Define rpc getter to use with destructuring assignment
   * @returns rpc client
   */
  get rpc(): Rpc {
    return this.getRpc();
  }

  /**
   * Define tx getter to use with destructuring assignment
   * @returns tx-related functionality
   */
  get tx(): Tx {
    return this.getTx();
  }

  /**
   * Define mnemonic getter to use with destructuring assignment
   * @returns mnemonic-related functionality
   */
  get mnemonic(): Mnemonic {
    return this.getMnemonic();
  }

  /**
   * Define keys getter to use with destructuring assignment
   * @returns key-related functionality
   */
  get keys(): Keys {
    return this.getKeys();
  }

  /**
   * Define signing getter to use with destructuring assignment
   * @returns Non-Tx signing functionality
   */
  get signing(): Signing {
    return this.getSigning();
  }

  /**
   * Define signing getter to use with destructuring assignment
   * @returns Masp utilities for handling params
   */
  get masp(): Masp {
    return this.getMasp();
  }

  /**
   * Define crypto getter to use with destructuring assignment
   * @returns Utilities for encrypting and decrypting data
   */
  get crypto(): Crypto {
    return this.getCrypto();
  }

  /**
   * Define version getter for use with destructuring assignment
   * @returns Version from package.json
   */
  get version(): string {
    return this.getVersion();
  }
}
