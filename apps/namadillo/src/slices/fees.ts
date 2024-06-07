import BigNumber from "bignumber.js";
import { getSdkInstance } from "hooks";
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
      const { rpc } = await getSdkInstance();
      const result = await rpc.queryGasCosts();
      const nativeTokenCost = result.find(([token]) => token === nativeToken);
      invariant(!!nativeTokenCost, "Error querying minimum gas price");
      const asBigNumber = new BigNumber(nativeTokenCost![1]);
      invariant(
        !asBigNumber.isNaN(),
        "Error converting minimum gas price to BigNumber"
      );
      return asBigNumber;
    },
  };
});
