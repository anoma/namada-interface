import initSdk from "@heliax/namada-sdk/inline-init";
import { Sdk, getSdk } from "@heliax/namada-sdk/web";
import { createStore } from "jotai";
import { createContext, useContext, useEffect, useState } from "react";
import { nativeTokenAtom, rpcUrlAtom } from "slices/settings";

export const SdkContext = createContext<Sdk | null>(null);

const initializeSdk = async (): Promise<Sdk> => {
  const { cryptoMemory } = await initSdk();
  const store = createStore();
  const rpcUrl = store.get(rpcUrlAtom);
  const nativeToken = store.get(nativeTokenAtom);
  const sdk = getSdk(cryptoMemory, rpcUrl, "", nativeToken);
  return sdk;
};

// Global instance of initialized SDK
const sdkInstance = initializeSdk();

// Helper to access SDK instance
export const getSdkInstance = async (): Promise<Sdk> => sdkInstance;

export const SdkProvider: React.FC = ({ children }) => {
  const [sdk, setSdk] = useState<Sdk>();

  useEffect(() => {
    getSdkInstance().then((sdk) => setSdk(sdk));
  }, []);

  return (
    <>
      {sdk ?
        <SdkContext.Provider value={sdk}> {children} </SdkContext.Provider>
      : null}
    </>
  );
};

export const useSdk = (): Sdk => {
  const sdkContext = useContext(SdkContext);

  if (!sdkContext) {
    throw new Error("sdkContext has to be used within <SdkContext.Provider>");
  }

  return sdkContext;
};
