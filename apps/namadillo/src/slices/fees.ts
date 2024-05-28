import BigNumber from "bignumber.js";
import { invariant } from "framer-motion";
import { getSdkInstance } from "hooks";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { accountsAtom } from "slices/accounts";
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
      const result = (await rpc.queryGasCosts()) as [string, string][];
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

export const isRevealPkNeededAtom = (() => {
  type RevealPkNeededMap = { [address: string]: boolean };

  const base = atom(new Promise<RevealPkNeededMap>(() => {}));

  return atom(
    async (get) => {
      const map = await get(base);

      return (address: string): boolean => {
        if (!(address in map)) {
          throw new Error("address not found in public key map");
        }
        return map[address];
      };
    },
    (get, set) =>
      set(
        base,
        (async (): Promise<RevealPkNeededMap> => {
          const accounts = get(accountsAtom);
          const transparentAccounts = accounts.filter(
            (account) => !account.isShielded
          );
          const { rpc } = await getSdkInstance();

          const entries = await Promise.all(
            transparentAccounts.map(async ({ address }) => {
              const publicKey = await rpc.queryPublicKey(address);
              return [address, !publicKey];
            })
          );

          return Object.fromEntries(entries);
        })()
      )
  );
})();
