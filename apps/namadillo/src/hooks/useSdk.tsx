import initSdk from "@heliax/namada-sdk/inline-init";
import { Sdk, getSdk } from "@heliax/namada-sdk/web";
import { createContext, useContext, useEffect, useState } from "react";

const {
  NAMADA_INTERFACE_NAMADA_URL: rpcUrl = "http://localhost:27657",
  NAMADA_INTERFACE_NAMADA_TOKEN:
    token = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

export const SdkContext = createContext<Sdk | null>(null);

const initializeSdk = async (): Promise<Sdk> => {
  const { cryptoMemory } = await initSdk();
  const sdk = getSdk(cryptoMemory, rpcUrl, "", token);
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
