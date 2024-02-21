import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { init } from "@namada/shared/src/init";
import { Rpc } from "rpc";
import { Tx } from "tx";

/**
 * Sdk
 *
 * API for interacting with Namada SDK
 */
export class Sdk {
  constructor(
    protected readonly sdk: SdkWasm,
    protected readonly query: QueryWasm,
    protected readonly url: string,
    protected readonly nativeToken: string
  ) {}

  /**
   * Returns an initialized Sdk class
   *
   * @param {string} url - RPC url for use with SDK
   * @param {string} token - Native token of the target chain, if not provided, an attempt to query it will be made
   *
   * @return {Sdk}
   */
  async init(url: string, token?: string): Promise<Sdk> {
    // Load and initialize shared wasm
    const sharedWasm = await fetch("shared.namada.wasm").then((wasm) =>
      wasm.arrayBuffer()
    );
    await init(sharedWasm);

    // Instantiate QueryWasm
    const query = new QueryWasm(url);

    let nativeToken: string = "";

    // Token not provided, make an attempt to query it
    if (!token) {
      try {
        const result = await query.query_native_token();
        nativeToken = result;
      } catch (e) {
        throw new Error("Unable to Query native token!");
      }
    }

    if (!nativeToken) {
      // Inform user to provide token
      throw new Error("Query token must be provided!");
    }

    // Instantiate SdkWasm
    const sdk = new SdkWasm(url, nativeToken);
    return new Sdk(sdk, query, url, nativeToken);
  }

  /**
   * Return initialized Rpc class
   */
  getRpc(): Rpc {
    return new Rpc(this.sdk, this.query);
  }

  /**
   * Return initialized Tx class
   */
  getTx(): Tx {
    return new Tx(this.sdk, this.query);
  }

  /**
   * Define rpc getter to use with destructuring assignment
   */
  get rpc(): Rpc {
    return this.getRpc();
  }

  /**
   * Define tx getter to use with destructuring assignment
   */
  get tx(): Tx {
    return this.getTx();
  }
}
