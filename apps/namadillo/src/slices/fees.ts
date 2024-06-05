import BigNumber from "bignumber.js";
import { getSdkInstance } from "hooks";
import invariant from "invariant";
import { atomWithQuery } from "jotai-tanstack-query";
import { chainAtom } from "slices/chain";

// TODO: remove harcoding of gas limit
export const GAS_LIMIT = new BigNumber(20_000);

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    nativeToken = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

export const minimumGasPriceAtom = atomWithQuery<BigNumber>((get) => {
  const chain = get(chainAtom);
  return {
    queryKey: ["minimum-gas-price-" + chain.chainId],
    queryFn: async () => {
      const { rpc } = await getSdkInstance();
      // TODO: Can nativeToken ever be undefined?
      invariant(!!nativeToken, "Native token is undefined");
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
