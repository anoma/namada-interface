import initSync from "initSync";
import { Sdk } from "../sdk";
import { NATIVE_TOKEN as nativeToken, RPC_URL as rpcUrl } from "./data";

// Simplified wrapper to handle initializing SDK for tests
export const initSdk = (): Sdk => {
  return initSync(rpcUrl, nativeToken);
};
