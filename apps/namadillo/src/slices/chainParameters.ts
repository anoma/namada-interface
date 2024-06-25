import BigNumber from "bignumber.js";
import { atomWithQuery } from "jotai-tanstack-query";
import { indexerApiAtom } from "./api";
import { chainAtom } from "./chain";

type ChainParameters = {
  unbondingPeriodInDays: bigint;
  apr: BigNumber;
};

export const chainParametersAtom = atomWithQuery<ChainParameters>((get) => {
  const chain = get(chainAtom);
  const api = get(indexerApiAtom);

  return {
    queryKey: ["chain-parameters", chain.chainId],
    queryFn: async () => {
      const parametersResponse = await api.apiV1ChainParametersGet();
      const parameters = parametersResponse.data;

      return {
        unbondingPeriodInDays: BigInt(parameters.unbondingLength),
        apr: BigNumber(parameters.apr),
      };
    },
  };
});
