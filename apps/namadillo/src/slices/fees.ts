import { DefaultApi } from "@anomaorg/namada-indexer-client";
import BigNumber from "bignumber.js";
import invariant from "invariant";
import { atomWithQuery } from "jotai-tanstack-query";
import { nativeTokenAtom } from "./settings";

// TODO: remove harcoding of gas limit
export const GAS_LIMIT = new BigNumber(20_000);

export const minimumGasPriceAtom = atomWithQuery<BigNumber>((get) => {
  const nativeToken = get(nativeTokenAtom);
  return {
    queryKey: ["minimum-gas-price", nativeToken],
    queryFn: async () => {
      const api = new DefaultApi();
      const gasTableResponse = await api.apiV1GasTableGet();

      // TODO: Can nativeToken ever be undefined?
      invariant(!!nativeToken, "Native token is undefined");
      const nativeTokenCost = gasTableResponse.data.find(
        ({ tokenAddress }) => tokenAddress === nativeToken
      );
      invariant(!!nativeTokenCost, "Error querying minimum gas price");
      const asBigNumber = new BigNumber(nativeTokenCost.amount);
      invariant(
        !asBigNumber.isNaN(),
        "Error converting minimum gas price to BigNumber"
      );
      return asBigNumber;
    },
  };
});
