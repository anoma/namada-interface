import namada from "@namada/chains/chains/namada";
import { integrations } from "@namada/integrations";
import { indexerApiAtom } from "atoms/api";
import {
  defaultServerConfigAtom,
  indexerUrlAtom,
  namadaExtensionConnectedAtom,
  rpcUrlAtom,
} from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import { atomWithQuery } from "jotai-tanstack-query";
import { ChainParameters, ChainSettings } from "types";
import { fetchChainParameters, fetchRpcUrlFromIndexer } from "./services";

export const chainAtom = atomWithQuery<ChainSettings>((get) => {
  const chainParameters = get(chainParametersAtom);
  const indexerRpcUrl = get(indexerRpcUrlAtom);
  const rpcUrl = get(rpcUrlAtom);
  const indexerUrl = get(indexerUrlAtom);
  const tomlConfig = get(defaultServerConfigAtom);
  const extensionConnected = get(namadaExtensionConnectedAtom);

  return {
    queryKey: [
      "chain",
      rpcUrl,
      chainParameters,
      indexerRpcUrl,
      extensionConnected,
    ],
    staleTime: Infinity,
    retry: false,
    ...queryDependentFn(async () => {
      const rpcUrl = get(rpcUrlAtom);
      const extensionChainId =
        extensionConnected ?
          (await integrations.namada.getChain())?.chainId
        : "";

      return {
        id: namada.id,
        extensionId: namada.extension.id,
        bench32Prefix: namada.bech32Prefix,
        rpcUrl,
        chainId: extensionChainId || chainParameters.data!.chainId,
        unbondingPeriodInEpochs:
          chainParameters.data!.epochInfo.unbondingPeriodInEpochs,
        nativeTokenAddress: chainParameters.data!.nativeTokenAddress,
      };
    }, [!!indexerUrl, indexerRpcUrl, chainParameters, tomlConfig]),
  };
});

export const nativeTokenAddressAtom = atomWithQuery<string>((get) => {
  const chain = get(chainAtom);
  return {
    queryKey: ["native-token-address"],
    enabled: chain.isSuccess,
    queryFn: async () => {
      return chain.data!.nativeTokenAddress;
    },
  };
});

// Prefer calling settings@rpcUrlAtom instead, because default rpc url might be
// overrided by the user
export const indexerRpcUrlAtom = atomWithQuery<string>((get) => {
  const indexerUrl = get(indexerUrlAtom);
  const api = get(indexerApiAtom);
  return {
    queryKey: ["rpc-url", indexerUrl],
    staleTime: Infinity,
    enabled: !!indexerUrl,
    queryFn: async () => fetchRpcUrlFromIndexer(api),
  };
});

export const chainParametersAtom = atomWithQuery<ChainParameters>((get) => {
  const indexerUrl = get(indexerUrlAtom);
  const api = get(indexerApiAtom);
  return {
    queryKey: ["chain-parameters", indexerUrl],
    staleTime: Infinity,
    enabled: !!indexerUrl,
    queryFn: async () => fetchChainParameters(api),
  };
});
