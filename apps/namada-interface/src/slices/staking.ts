import BigNumber from "bignumber.js";
import { atom } from "jotai";
import { MyValidator, myValidatorsAtom } from "./validators";

type StakingTotals = {
  totalBonded: BigNumber;
  totalUnbonded: BigNumber;
  totalWithdrawable: BigNumber;
};

type StakingTotalsState =
  | {
      isSuccess: boolean;
      isLoading: boolean;
      data: StakingTotals;
    }
  | { isSuccess: false; data: undefined };

export const getStakingTotalAtom = atom<StakingTotalsState>((get) => {
  const myValidators = get(myValidatorsAtom);

  if (!myValidators.isSuccess) {
    return {
      data: undefined,
      isLoading: true,
      isSuccess: myValidators.isSuccess,
    };
  }

  const totalBonded = myValidators.data.reduce(
    (acc: BigNumber, validator: MyValidator) =>
      acc.plus(validator.stakedAmount ?? 0),
    new BigNumber(0)
  );

  const totalUnbonded = myValidators.data.reduce(
    (acc: BigNumber, validator: MyValidator) =>
      acc.plus(validator.unbondedAmount ?? 0),
    new BigNumber(0)
  );

  const totalWithdrawable = myValidators.data.reduce(
    (acc: BigNumber, validator: MyValidator) =>
      acc.plus(validator.withdrawableAmount ?? 0),
    new BigNumber(0)
  );

  return {
    isLoading: false,
    isSuccess: myValidators.isSuccess,
    data: {
      totalBonded,
      totalUnbonded,
      totalWithdrawable,
    },
  };
});
