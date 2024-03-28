import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { webcrypto } from "node:crypto";
import { Sdk } from "./sdk";
export * from "./index";
export * from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).crypto = webcrypto;

/**
 * Get the SDK instance
 * @async
 * @param cryptoMemory - WebAssembly.Memory of crypto package
 * @param url - URL of the node
 * @param storagePath - Path to store wallet files
 * @param [token] - Native token of the chain
 * @throws {Error} - Unable to Query native token
 * @returns - Sdk instance
 */
export async function getSdk(
  cryptoMemory: WebAssembly.Memory,
  url: string,
  storagePath: string,
  token?: string
): Promise<Sdk> {
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
  } else {
    nativeToken = token;
  }

  // Instantiate SdkWasm
  const sdk = new SdkWasm(url, nativeToken, storagePath);
  return new Sdk(sdk, query, cryptoMemory, url, nativeToken);
}
