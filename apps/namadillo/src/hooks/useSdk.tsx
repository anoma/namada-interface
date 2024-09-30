import initSdk from "@heliax/namada-sdk/inline-init";
import { getSdk, Sdk } from "@heliax/namada-sdk/web";
import { nativeTokenAddressAtom } from "atoms/chain";
import { rpcUrlAtom } from "atoms/settings";
import { getDefaultStore, useAtomValue } from "jotai";
import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Proxies from "../../scripts/proxies.json";

export enum MaspParamsStatus {
  Fetching = "fetching",
  Loaded = "loaded",
  Error = "error",
}

type SdkContext = {
  sdk?: Sdk;
  maspParamsStatus?: MaspParamsStatus;
};

export const SdkContext = createContext<SdkContext>({
  sdk: undefined,
  maspParamsStatus: undefined,
});

const { VITE_PROXY: isProxied } = import.meta.env;

const paramsUrl =
  isProxied ? `http://localhost:${Proxies[0].proxyPort}/proxy/` : undefined;

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

export const SdkProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [sdk, setSdk] = useState<Sdk>();
  const [maspParamsStatus, setMaspParamsStatus] = useState<MaspParamsStatus>();
  const nativeToken = useAtomValue(nativeTokenAddressAtom);

  useEffect(() => {
    if (nativeToken.data) {
      getSdkInstance().then((sdk) => {
        setSdk(sdk);
        const { masp } = sdk;
        masp.hasMaspParams().then((hasMaspParams) => {
          if (hasMaspParams) {
            return masp
              .loadMaspParams("")
              .then(() => setMaspParamsStatus(MaspParamsStatus.Loaded))
              .catch((e) => console.error(`${e}`));
          }
          setMaspParamsStatus(MaspParamsStatus.Fetching);
          masp
            .fetchAndStoreMaspParams(paramsUrl)
            .then(() => setMaspParamsStatus(MaspParamsStatus.Loaded))
            .catch((e) => {
              setMaspParamsStatus(MaspParamsStatus.Error);
              console.error(`Error downloading MASP params ${e}`);
            });
        });
      });
    }
  }, [nativeToken.data]);

  return (
    <>
      <SdkContext.Provider value={{ sdk, maspParamsStatus }}>
        {children}
      </SdkContext.Provider>
    </>
  );
};

export const useSdk = (): SdkContext => {
  return useContext(SdkContext);
};
