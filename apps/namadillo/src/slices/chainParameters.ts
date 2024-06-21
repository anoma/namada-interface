import BigNumber from "bignumber.js";
import invariant from "invariant";
import { Getter, atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { indexerApiAtom } from "./api";
import { indexerUrlAtom } from "./settings";

type ChainParameters = {
  unbondingPeriodInDays: bigint;
  apr: BigNumber;
  chainId: string;
  nativeTokenAddress: string;
};

// Prefer calling settings@rpcUrlAtom instead, because default rpc url might be
// overrided by the user
export const indexerRpcUrlAtom = atomWithQuery<string>((get) => {
  const indexerUrl = get(indexerUrlAtom);
  const api = get(indexerApiAtom);
  return {
    queryKey: ["rpc-url", indexerUrl],
    staleTime: Infinity,
    queryFn: async () => {
      const rpcUrl = await api.apiV1ChainRpcUrlGet();
      return rpcUrl.data.url;
    },
  };
});

export const chainParametersAtom = atomWithQuery<ChainParameters>((get) => {
  const indexerUrl = get(indexerUrlAtom);
  const api = get(indexerApiAtom);

  return {
    queryKey: ["chain-parameters", indexerUrl],
    staleTime: Infinity,
    queryFn: async () => {
      const parametersResponse = await api.apiV1ChainParametersGet();
      const parameters = parametersResponse.data;
      return {
        unbondingPeriodInDays: BigInt(parameters.unbondingLength),
        apr: BigNumber(parameters.apr),
        chainId: parameters.chainId,
        nativeTokenAddress: parameters.nativeTokenAddress,
      };
    },
  };
});

const getChainParametersProp = <K extends keyof ChainParameters>(
  get: Getter,
  key: K
): ChainParameters[K] => {
  const chainParameters = get(chainParametersAtom);
  invariant(chainParameters.data, "Chain parameters are not loaded");
  return chainParameters.data![key];
};

export const nativeTokenAddressAtom = atom<string>((get) => {
  return getChainParametersProp(get, "nativeTokenAddress");
});

export const chainIdAtom = atom<string>((get) => {
  return getChainParametersProp(get, "chainId");
});
