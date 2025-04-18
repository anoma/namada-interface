import { accountBalanceAtom } from "atoms/accounts";
import { shieldedTokensAtom } from "atoms/balance";
import { getTotalNam } from "atoms/balance/functions";
import { getStakingTotalAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { AtomWithQueryResult } from "jotai-tanstack-query";
import { useEffect, useState } from "react";

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

  // Add state to keep the last valid values
  const [stableValues, setStableValues] = useState({
    availableAmount: new BigNumber(0),
    bondedAmount: new BigNumber(0),
    unbondedAmount: new BigNumber(0),
    withdrawableAmount: new BigNumber(0),
  });

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

  // Current values from queries
  const currentAvailableAmount = new BigNumber(balance || 0);
  const currentBondedAmount = new BigNumber(stakeBalance?.totalBonded || 0);
  const currentUnbondedAmount = new BigNumber(stakeBalance?.totalUnbonded || 0);
  const currentWithdrawableAmount = new BigNumber(
    stakeBalance?.totalWithdrawable || 0
  );

  // Update stable values only when we have valid data and not in loading state
  useEffect(() => {
    if (
      isBalanceLoaded &&
      isStakedBalanceLoaded &&
      !isFetchingBalance &&
      !isFetchingStaking
    ) {
      setStableValues({
        availableAmount: currentAvailableAmount,
        bondedAmount: currentBondedAmount,
        unbondedAmount: currentUnbondedAmount,
        withdrawableAmount: currentWithdrawableAmount,
      });
    }
  }, [
    isBalanceLoaded,
    isStakedBalanceLoaded,
    isFetchingBalance,
    isFetchingStaking,
    currentAvailableAmount.toString(),
    currentBondedAmount.toString(),
    currentUnbondedAmount.toString(),
    currentWithdrawableAmount.toString(),
  ]);

  // Use stable values or current values, depending on loading state
  const availableAmount =
    isFetchingBalance ? stableValues.availableAmount : currentAvailableAmount;
  const bondedAmount =
    isFetchingStaking ? stableValues.bondedAmount : currentBondedAmount;
  const unbondedAmount =
    isFetchingStaking ? stableValues.unbondedAmount : currentUnbondedAmount;
  const withdrawableAmount =
    isFetchingStaking ?
      stableValues.withdrawableAmount
    : currentWithdrawableAmount;

  const totalTransparentAmount = BigNumber.sum(
    availableAmount,
    bondedAmount,
    unbondedAmount,
    withdrawableAmount
  );

  return {
    isLoading:
      (isFetchingStaking || isFetchingBalance) &&
      stableValues.bondedAmount.eq(0) &&
      stableValues.availableAmount.eq(0),
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
