import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { Sdk } from "../sdk";
import { NATIVE_TOKEN as nativeToken, RPC_URL as rpcUrl } from "./data";

/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoMemory = require("@namada/crypto").__wasm.memory;

export const initSdk = async (): Promise<Sdk> => {
  const sdk = new SdkWasm(rpcUrl, nativeToken);
  const query = new QueryWasm(rpcUrl);

  return new Sdk(sdk, query, cryptoMemory, rpcUrl, nativeToken);
};
