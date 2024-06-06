import { atomWithQuery } from "jotai-tanstack-query";
import { DefaultApi } from "namada-indexer-client";
import { chainAtom } from "./chain";

type ChainParameters = {
  unbondingPeriodInDays: number;
};

export const chainParametersAtom = atomWithQuery<ChainParameters>((get) => {
  const chain = get(chainAtom);
  return {
    queryKey: ["chain-parameters-" + chain.chainId],
    queryFn: async () => {
      const api = new DefaultApi();
      const parametersResponse = await api.apiV1ChainParametersGet();
      const parameters = parametersResponse.data;

      return {
        unbondingPeriodInDays: parameters.unbondingLength,
      };
    },
  };
});
