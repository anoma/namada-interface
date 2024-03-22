import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { Sdk } from "./sdk";

/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoMemory = require("@namada/crypto").__wasm.memory;

/**
 * Initialize SDK for Node JS environments
 * @param {string} url - URL of the node
 * @param {string} nativeToken - Address of the native token
 * @returns {Sdk} SDK instance
 */
export default function initSync(url: string, nativeToken: string): Sdk {
  const sdk = new SdkWasm(url, nativeToken);
  const query = new QueryWasm(url);
  return new Sdk(sdk, query, cryptoMemory, url, nativeToken);
}
