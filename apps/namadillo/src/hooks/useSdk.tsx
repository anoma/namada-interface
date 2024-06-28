import initSdk from "@heliax/namada-sdk/inline-init";
import { Sdk, getSdk } from "@heliax/namada-sdk/web";
import { nativeTokenAddressAtom } from "atoms/chain";
import { rpcUrlAtom } from "atoms/settings";
import { getDefaultStore, useAtomValue } from "jotai";
import { createContext, useContext, useEffect, useState } from "react";

export const SdkContext = createContext<Sdk | null>(null);

const initializeSdk = async (): Promise<Sdk> => {
  const { cryptoMemory } = await initSdk();
  const store = getDefaultStore();
  const rpcUrl = store.get(rpcUrlAtom);
  const nativeToken = store.get(nativeTokenAddressAtom);

  if (!nativeToken.isSuccess) {
    throw "Native token not loaded";
  }

  const sdk = getSdk(cryptoMemory, rpcUrl, "", nativeToken.data);
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

export const SdkProvider: React.FC = ({ children }) => {
  const [sdk, setSdk] = useState<Sdk>();
  const nativeToken = useAtomValue(nativeTokenAddressAtom);

  useEffect(() => {
    if (nativeToken.data) {
      getSdkInstance().then((sdk) => setSdk(sdk));
    }
  }, [nativeToken.data]);

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
