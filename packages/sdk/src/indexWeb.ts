import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { Sdk } from "./index";
export * from "./index";
export * from "./utils";

/**
 * Get the SDK instance
 * @async
 * @param cryptoMemory - WebAssembly.Memory of crypto package
 * @param url - URL of the node
 * @param dbName - Name of the database for the serialized wallet
 * @param [token] - Native token of the chain
 * @throws {Error} - Unable to Query native token
 * @returns - Sdk instance
 */
export function getSdk(
  cryptoMemory: WebAssembly.Memory,
  url: string,
  dbName: string,
  token: string
): Sdk {
  // Instantiate QueryWasm
  const query = new QueryWasm(url);

  // Instantiate SdkWasm
  const sdk = new SdkWasm(url, token, dbName);
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
