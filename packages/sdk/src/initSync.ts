import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { Sdk } from "./sdk";

/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoMemory = require("@namada/crypto").__wasm.memory;

/**
 * Initialize SDK for Node JS environments
 * @param {string} url
 * @param {string} nativeToken
 * @returns {Sdk}
 */
export default function initSync(url: string, nativeToken: string): Sdk {
  const sdk = new SdkWasm(url, nativeToken);
  const query = new QueryWasm(url);
  return new Sdk(sdk, query, cryptoMemory, url, nativeToken);
}
