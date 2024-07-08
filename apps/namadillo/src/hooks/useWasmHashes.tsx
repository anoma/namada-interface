import { Namada, useIntegration } from "@namada/integrations";
import { WasmHash } from "@namada/types";
import { chainAtom, nativeTokenAddressAtom } from "atoms/chain";
import { rpcUrlAtom } from "atoms/settings";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { getSdkInstance } from "./useSdk";

export const useWasmHashes = (): void => {
  const chain = useAtomValue(chainAtom);
  const rpcUrl = useAtomValue(rpcUrlAtom);
  const nativeToken = useAtomValue(nativeTokenAddressAtom);
  const integration = useIntegration("namada");
  const [wasmHashesByChainId, setWasmHashesByChainId] = useState<
    Record<string, WasmHash[]>
  >({});

  const chainId = chain.data ? chain.data.chainId : undefined;

  const fetchWasmHashes = useCallback(
    async (chainId: string, integration: Namada): Promise<WasmHash[]> => {
      const wasmHashes = await integration.getTxWasmHashes(chainId);
      const sdk = await getSdkInstance();
      if (!wasmHashes) {
        const { rpc } = sdk;
        const hashes = await rpc.queryWasmHashes();
        await integration.addTxWasmHashes(chainId, hashes);
        return hashes;
      }
      return wasmHashes;
    },
    [chainId]
  );

  useEffect(() => {
    // Check for nativeToken & rpcUrl as SDK is accessed and
    // invoked in the function called below:
    if (
      chainId &&
      nativeToken.status === "success" &&
      rpcUrl &&
      !wasmHashesByChainId[chainId]
    ) {
      fetchWasmHashes(chainId, integration)
        .catch((e) => console.error(e))
        .then((wasmHashes) => {
          if (wasmHashes) {
            setWasmHashesByChainId({
              ...wasmHashesByChainId,
              [chainId]: wasmHashes,
            });
          }
        });
    }
  }, [chainId, nativeToken.status, rpcUrl]);
};
