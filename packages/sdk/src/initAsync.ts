import { init as initCrypto } from "@namada/crypto/src/init";
import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { init as initShared } from "@namada/shared/src/init";

import { Sdk } from "sdk";

/**
 * Returns an initialized Sdk class asynchronously. This is required to use
 * this library in web applications.
 * @async
 * @param {string} url - RPC url for use with SDK
 * @param {string} [token] - Native token of the target chain, if not provided, an attempt to query it will be made
 * @returns {Sdk} Instance of initialized Sdk class
 */
export default async function initAsync(
  url: string,
  token?: string
): Promise<Sdk> {
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
