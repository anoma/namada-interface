import { accountBalanceAtom } from "atoms/accounts";
import { shieldedTokensAtom } from "atoms/balance";
import { getTotalNam } from "atoms/balance/functions";
import { getStakingTotalAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { AtomWithQueryResult } from "jotai-tanstack-query";

export type useBalancesOutput = {
  isLoading: boolean;
  isSuccess: boolean;
  stakeQuery: AtomWithQueryResult;
  balanceQuery: AtomWithQueryResult;
  shieldedAmountQuery: AtomWithQueryResult;
  bondedAmount: BigNumber;
  availableAmount: BigNumber;
  unbondedAmount: BigNumber;
  withdrawableAmount: BigNumber;
  shieldedNamAmount: BigNumber;
  totalTransparentAmount: BigNumber;
};

export const useBalances = (): useBalancesOutput => {
  const totalStakedBalanceQuery = useAtomValue(getStakingTotalAtom);
  const totalAccountBalanceQuery = useAtomValue(accountBalanceAtom);
  const shieldedNamQuery = useAtomValue(shieldedTokensAtom);

  const {
    data: balance,
    isLoading: isFetchingBalance,
    isSuccess: isBalanceLoaded,
  } = totalAccountBalanceQuery;

  const {
    data: stakeBalance,
    isLoading: isFetchingStaking,
    isSuccess: isStakedBalanceLoaded,
  } = totalStakedBalanceQuery;

  const { data: shieldedNamAmount } = shieldedNamQuery;

  const availableAmount = new BigNumber(balance || 0);
  const bondedAmount = new BigNumber(stakeBalance?.totalBonded || 0);
  const unbondedAmount = new BigNumber(stakeBalance?.totalUnbonded || 0);
  const withdrawableAmount = new BigNumber(
    stakeBalance?.totalWithdrawable || 0
  );

  const totalTransparentAmount = BigNumber.sum(
    availableAmount,
    bondedAmount,
    unbondedAmount,
    withdrawableAmount
  );

  return {
    isLoading: isFetchingStaking || isFetchingBalance,
    isSuccess: isBalanceLoaded && isStakedBalanceLoaded,
    stakeQuery: totalStakedBalanceQuery,
    balanceQuery: totalAccountBalanceQuery,
    shieldedAmountQuery: shieldedNamQuery,
    availableAmount,
    bondedAmount,
    unbondedAmount,
    withdrawableAmount,
    shieldedNamAmount: getTotalNam(shieldedNamAmount),
    totalTransparentAmount: totalTransparentAmount,
  };
};
