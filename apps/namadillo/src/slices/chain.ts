import namada from "@namada/chains/chains/namada";
import { integrations } from "@namada/integrations";
import { atomWithQuery } from "jotai-tanstack-query";
import { queryDependentFn } from "store/utils";
import { ChainSettings } from "types";
import { chainParametersAtom, indexerRpcUrlAtom } from "./chainParameters";
import { indexerUrlAtom, rpcUrlAtom } from "./settings";

export const chainAtom = atomWithQuery<ChainSettings>((get) => {
  const chainParameters = get(chainParametersAtom);
  const indexerRpcUrl = get(indexerRpcUrlAtom);
  const indexerUrl = get(indexerUrlAtom);

  return {
    queryKey: ["chain", indexerUrl, chainParameters, indexerRpcUrl],
    staleTime: Infinity,
    ...queryDependentFn(async () => {
      const rpcUrl = get(rpcUrlAtom);
      const extensionChainId = (await integrations.namada.getChain())?.chainId;

      return {
        id: namada.id,
        extensionId: namada.extension.id,
        bench32Prefix: namada.bech32Prefix,
        rpcUrl,
        chainId: extensionChainId || chainParameters.data!.chainId,
        unbondingPeriodInDays: chainParameters.data!.unbondingPeriodInDays,
        nativeTokenAddress: chainParameters.data!.nativeTokenAddress,
      };
    }, [!!indexerUrl, indexerRpcUrl, chainParameters]),
  };
});
