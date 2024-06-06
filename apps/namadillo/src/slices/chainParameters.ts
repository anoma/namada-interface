import { DefaultApi } from "@anomaorg/namada-indexer-client";
import { atomWithQuery } from "jotai-tanstack-query";
import { chainAtom } from "./chain";

type ChainParameters = {
  unbondingPeriodInDays: bigint;
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
        unbondingPeriodInDays: BigInt(parameters.unbondingLength),
      };
    },
  };
});
