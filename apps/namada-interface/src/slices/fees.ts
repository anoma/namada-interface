import { Query } from "@namada/shared";
import BigNumber from "bignumber.js";
import { atom } from "jotai";

import { accountsAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";

// TODO: remove harcoding of gas limit
export const GAS_LIMIT = new BigNumber(20_000);

const minimumGasPriceAtom = (() => {
  const base = atom(new Promise<BigNumber>(() => {}));

  return atom(
    (get) => get(base),
    async (get, set) => {
      const {
        rpc,
        currency: { address: nativeToken },
      } = get(chainAtom);
      const query = new Query(rpc);

      const promise = (async () => {
        const result = (await query.query_gas_costs()) as [string, string][];
        const nativeTokenCost = result.find(([token]) => token === nativeToken);

        if (!nativeTokenCost) {
          throw new Error("Error querying minimum gas price");
        }

        const asBigNumber = new BigNumber(nativeTokenCost[1]);

        if (asBigNumber.isNaN()) {
          throw new Error("Error converting minimum gas price to BigNumber");
        }

        return asBigNumber;
      })();

      set(base, promise);
    }
  );
})();

const isRevealPkNeededAtom = atom(async (get) => {
  const accounts = await get(accountsAtom);
  const transparentAccounts = accounts.filter((account) => !account.isShielded);

  const { rpc } = get(chainAtom);
  const query = new Query(rpc);

  const map: Record<string, string | null> = {};
  await Promise.all(
    transparentAccounts.map(async ({ address }) => {
      const publicKey = await query.query_public_key(address);
      map[address] = publicKey;
    })
  );

  return (address: string): boolean => {
    if (!(address in map)) {
      throw new Error("address not found in public key map");
    }
    return map[address] === null;
  };
});

export { isRevealPkNeededAtom, minimumGasPriceAtom };
