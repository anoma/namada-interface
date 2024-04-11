import BigNumber from "bignumber.js";
import { atom } from "jotai";
import { myValidatorsAtom } from "./validators";

type StakingTotals = {
  totalBonded: BigNumber;
  totalUnbonded: BigNumber;
  totalWithdrawable: BigNumber;
};

export const myStakingPositionAtom = atom([]);

export const getStakingTotalAtom = atom<StakingTotals>((get) => {
  const myValidators = get(myValidatorsAtom);

  const totalBonded = myValidators.reduce(
    (acc, validator) => acc.plus(validator.stakedAmount ?? 0),
    new BigNumber(0)
  );

  const totalUnbonded = myValidators.reduce(
    (acc, validator) => acc.plus(validator.unbondedAmount ?? 0),
    new BigNumber(0)
  );

  const totalWithdrawable = myValidators.reduce(
    (acc, validator) => acc.plus(validator.withdrawableAmount ?? 0),
    new BigNumber(0)
  );

  return {
    totalBonded,
    totalUnbonded,
    totalWithdrawable,
  };
});
