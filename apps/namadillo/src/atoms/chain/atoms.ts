import namada from "@namada/chains/chains/namada";
import { indexerApiAtom } from "atoms/api";
import {
  defaultServerConfigAtom,
  indexerUrlAtom,
  rpcUrlAtom,
} from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atomWithQuery } from "jotai-tanstack-query";
import { ChainParameters, ChainSettings } from "types";
import { calculateUnbondingPeriod } from "./functions";
import { fetchChainParameters, fetchRpcUrlFromIndexer } from "./services";

export const chainAtom = atomWithQuery<ChainSettings>((get) => {
  const chainParameters = get(chainParametersAtom);
  const indexerRpcUrl = get(indexerRpcUrlAtom);
  const rpcUrl = get(rpcUrlAtom);
  const indexerUrl = get(indexerUrlAtom);
  const tomlConfig = get(defaultServerConfigAtom);

  return {
    queryKey: ["chain", rpcUrl, chainParameters, indexerRpcUrl],
    staleTime: Infinity,
    retry: false,
    ...queryDependentFn(async () => {
      const rpcUrl = get(rpcUrlAtom);

      return {
        id: namada.id,
        extensionId: namada.extension.id,
        bench32Prefix: namada.bech32Prefix,
        rpcUrl,
        chainId: chainParameters.data!.chainId,
        unbondingPeriod: chainParameters.data!.unbondingPeriod,
        nativeTokenAddress: chainParameters.data!.nativeTokenAddress,
        checksums: chainParameters.data!.checksums,
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
    queryFn: async () => {
      const parameters = await fetchChainParameters(api);
      return {
        ...parameters,
        apr: BigNumber(parameters.apr),
        unbondingPeriod: calculateUnbondingPeriod(parameters),
      };
    },
  };
});
