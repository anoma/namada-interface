import { Sdk, getSdk } from "@heliax/namada-sdk/web";
import initSdk from "@heliax/namada-sdk/web-init";
import { createContext, useContext, useEffect, useState } from "react";

const { NAMADA_INTERFACE_NAMADA_URL: rpcUrl = "http://localhost:27657" } =
  process.env;
export const SdkContext = createContext<Sdk | null>(null);

export const SdkProvider: React.FC = ({ children }) => {
  const [sdk, setSdk] = useState<Sdk>();

  const initialize = async (): Promise<void> => {
    const { cryptoMemory } = await initSdk();
    const sdk = getSdk(
      cryptoMemory,
      rpcUrl,
      "",
      "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e"
    );
    setSdk(sdk);
  };

  useEffect(() => {
    initialize();
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
