import initSdk from "@heliax/namada-sdk/inline-init";
import { Sdk, getSdk } from "@heliax/namada-sdk/web";
import { Namada, useIntegration } from "@namada/integrations";
import { WasmHash } from "@namada/types";
import { chainAtom, nativeTokenAddressAtom } from "atoms/chain";
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

const fetchWasmHashes = async (
  chainId: string,
  sdk: Sdk,
  integration: Namada
): Promise<WasmHash[] | undefined> => {
  const wasmHashes = await integration.getTxWasmHashes(chainId);
  if (!wasmHashes) {
    const { rpc } = sdk;
    return await rpc.queryWasmHashes();
  }
};

export const SdkProvider: React.FC = ({ children }) => {
  const [sdk, setSdk] = useState<Sdk>();
  const nativeToken = useAtomValue(nativeTokenAddressAtom);
  // TODO: Is this the best place for this?
  const chain = useAtomValue(chainAtom);
  const integration = useIntegration("namada");

  useEffect(() => {
    if (nativeToken.data) {
      getSdkInstance().then((sdk) => setSdk(sdk));
    }
  }, [nativeToken.data]);

  useEffect(() => {
    if (chain.data && sdk) {
      const { chainId } = chain.data;
      fetchWasmHashes(chainId, sdk, integration).then((hashes) => {
        // Add new wasm hashes if they are returned
        if (hashes) {
          integration.addTxWasmHashes(chainId, hashes);
        }
      });
    }
  }, [chain, sdk]);

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
