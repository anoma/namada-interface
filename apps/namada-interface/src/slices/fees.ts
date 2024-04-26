import { Query } from "@namada/shared";
import BigNumber from "bignumber.js";
import { invariant } from "framer-motion";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { accountsAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";

// TODO: remove harcoding of gas limit
export const GAS_LIMIT = new BigNumber(20_000);

export const minimumGasPriceAtom = atomWithQuery<BigNumber>((get) => {
  const chain = get(chainAtom);
  return {
    queryKey: ["minimum-gas-price-" + chain.chainId],
    queryFn: async () => {
      const nativeToken = chain.currency.address;
      const query = new Query(chain.rpc);
      invariant(!!nativeToken, "Native token is undefined");
      const result = (await query.query_gas_costs()) as [string, string][];
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
          const accounts = await get(accountsAtom);
          const transparentAccounts = accounts.filter(
            (account) => !account.isShielded
          );

          const { rpc } = get(chainAtom);
          const query = new Query(rpc);

          const entries = await Promise.all(
            transparentAccounts.map(async ({ address }) => {
              const publicKey = await query.query_public_key(address);
              return [address, !publicKey];
            })
          );

          return Object.fromEntries(entries);
        })()
      )
  );
})();
