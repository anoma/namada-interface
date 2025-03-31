import { shieldedTokensAtom, transparentTokensAtom } from "atoms/balance";
import { getTotalDollar } from "atoms/balance/functions";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { AtomWithQueryResult } from "jotai-tanstack-query";

type AmountsInFiatOutput = {
  shieldedAmountInFiat: BigNumber;
  unshieldedAmountInFiat: BigNumber;
  totalAmountInFiat: BigNumber;
  shieldedQuery: AtomWithQueryResult;
  unshieldedQuery: AtomWithQueryResult;
};

export const useAmountsInFiat = (): AmountsInFiatOutput => {
  const shieldedTokensQuery = useAtomValue(shieldedTokensAtom);
  const unshieldedTokensQuery = useAtomValue(transparentTokensAtom);
  const shieldedDollars = getTotalDollar(shieldedTokensQuery.data);
  const unshieldedDollars = getTotalDollar(unshieldedTokensQuery.data);
  const totalAmountInDollars = shieldedDollars.plus(unshieldedDollars);
  return {
    shieldedQuery: shieldedTokensQuery,
    unshieldedQuery: unshieldedTokensQuery,
    totalAmountInFiat: totalAmountInDollars,
    shieldedAmountInFiat: shieldedDollars,
    unshieldedAmountInFiat: unshieldedDollars,
  };
};
