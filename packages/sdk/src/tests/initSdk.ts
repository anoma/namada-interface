import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import init from "../initNode";
import { Sdk } from "../sdk";
import { NATIVE_TOKEN as nativeToken, RPC_URL as rpcUrl } from "./data";

// Simplified wrapper to handle initializing SDK for tests
export const initSdk = (): Sdk => {
  const { cryptoMemory } = init();
  const query = new QueryWasm(rpcUrl);
  const sdk = new SdkWasm(rpcUrl, nativeToken, "some db name");

  return new Sdk(sdk, query, cryptoMemory, rpcUrl, nativeToken);
};
