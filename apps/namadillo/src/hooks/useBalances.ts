import { accountBalanceAtom } from "atoms/accounts";
import { getStakingTotalAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { AtomWithQueryResult } from "jotai-tanstack-query";

export type useBalancesOutput = {
  isLoading: boolean;
  isSuccess: boolean;
  stakeQuery: AtomWithQueryResult;
  balanceQuery: AtomWithQueryResult;
  bondedAmount: BigNumber;
  availableAmount: BigNumber;
  unbondedAmount: BigNumber;
  withdrawableAmount: BigNumber;
  shieldedAmount: BigNumber;
  totalAmount: BigNumber;
};

export const useBalances = (): useBalancesOutput => {
  const totalStakedBalance = useAtomValue(getStakingTotalAtom);
  const totalAccountBalance = useAtomValue(accountBalanceAtom);

  const {
    data: balance,
    isLoading: isFetchingBalance,
    isSuccess: isBalanceLoaded,
  } = totalAccountBalance;

  const {
    data: stakeBalance,
    isLoading: isFetchingStaking,
    isSuccess: isStakedBalanceLoaded,
  } = totalStakedBalance;

  const availableAmount = new BigNumber(balance || 0);
  const bondedAmount = new BigNumber(stakeBalance?.totalBonded || 0);
  const unbondedAmount = new BigNumber(stakeBalance?.totalUnbonded || 0);
  const withdrawableAmount = new BigNumber(
    stakeBalance?.totalWithdrawable || 0
  );
  const shieldedAmount = new BigNumber(0);
  const totalAmount = BigNumber.sum(
    availableAmount,
    bondedAmount,
    unbondedAmount,
    withdrawableAmount,
    shieldedAmount
  );

  return {
    isLoading: isFetchingStaking || isFetchingBalance,
    isSuccess: isBalanceLoaded && isStakedBalanceLoaded,
    stakeQuery: totalStakedBalance,
    balanceQuery: totalAccountBalance,
    availableAmount,
    bondedAmount,
    unbondedAmount,
    withdrawableAmount,
    shieldedAmount,
    totalAmount,
  };
};
