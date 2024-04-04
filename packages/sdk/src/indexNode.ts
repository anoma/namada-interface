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
export function getSdk(
  cryptoMemory: WebAssembly.Memory,
  url: string,
  storagePath: string,
  token: string
): Sdk {
  // Instantiate QueryWasm
  const query = new QueryWasm(url);

  // Instantiate SdkWasm
  const sdk = new SdkWasm(url, token, storagePath);
  return new Sdk(sdk, query, cryptoMemory, url, token);
}

/**
 * Query native token from the node
 * @async
 * @param rpc - URL of the node
 * @returns
 */
export async function getNativeToken(rpc: string): Promise<string> {
  return await new QueryWasm(rpc).query_native_token();
}
