import BigNumber from "bignumber.js";
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
    enabled: !!indexerUrl,
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
    enabled: !!indexerUrl,
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

export const nativeTokenAddressAtom = atomWithQuery<string>((get) => {
  const chainParameters = get(chainParametersAtom);
  return {
    queryKey: ["native-token-address"],
    enabled: chainParameters.isSuccess,
    queryFn: async () => {
      return chainParameters.data!.nativeTokenAddress;
    },
  };
});
