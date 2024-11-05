import initSdk from "@namada/sdk/inline-init";
import { getSdk, Sdk } from "@namada/sdk/web";
import { nativeTokenAddressAtom } from "atoms/chain";
import { maspIndexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import { getDefaultStore } from "jotai";

const initializeSdk = async (): Promise<Sdk> => {
  const { cryptoMemory } = await initSdk();
  const store = getDefaultStore();
  const rpcUrl = store.get(rpcUrlAtom);
  const maspIndexerUrl = store.get(maspIndexerUrlAtom);
  const nativeToken = store.get(nativeTokenAddressAtom);

  if (!nativeToken.isSuccess) {
    throw "Native token not loaded";
  }

  const sdk = getSdk(
    cryptoMemory,
    rpcUrl,
    maspIndexerUrl,
    "",
    nativeToken.data
  );
  return sdk;
};

// Global instance of initialized SDK
let sdkInstance: Promise<Sdk>;

// Helper to access SDK instance
export const getSdkInstance = async (): Promise<Sdk> => {
  if (!sdkInstance) {
    sdkInstance = initializeSdk();
  }
  return sdkInstance;
};
