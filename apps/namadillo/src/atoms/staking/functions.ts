import { Account, BondProps, RedelegateProps } from "@namada/types";
import BigNumber from "bignumber.js";
import {
  Address,
  ChangeInStakingPosition,
  MyValidator,
  RedelegateChange,
  StakingTotals,
} from "types";

export const toStakingTotal = (myValidators: MyValidator[]): StakingTotals => {
  const totalBonded = myValidators.reduce(
    (acc: BigNumber, validator: MyValidator) =>
      acc.plus(validator.stakedAmount ?? 0),
    new BigNumber(0)
  );

  const totalUnbonded = myValidators.reduce(
    (acc: BigNumber, validator: MyValidator) =>
      acc.plus(validator.unbondedAmount ?? 0),
    new BigNumber(0)
  );

  const totalWithdrawable = myValidators.reduce(
    (acc: BigNumber, validator: MyValidator) =>
      acc.plus(validator.withdrawableAmount ?? 0),
    new BigNumber(0)
  );

  return { totalBonded, totalUnbonded, totalWithdrawable };
};

export const getStakingChangesParams = (
  account: Account,
  nativeToken: Address,
  changes: ChangeInStakingPosition[]
): BondProps[] => {
  return changes.map((change) => ({
    source: account.address,
    validator: change.validatorId,
    amount: change.amount,
    nativeToken,
  }));
};

export const getRedelegateChangeParams = (
  account: Account,
  changes: RedelegateChange[]
): RedelegateProps[] => {
  return changes.map((change: RedelegateChange) => ({
    owner: account.address,
    ...change,
  }));
};
