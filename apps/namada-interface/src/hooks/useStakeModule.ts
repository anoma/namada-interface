import { Account } from "@namada/types";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { totalNamBalanceAtom } from "slices/accounts";
import { Validator, fetchMyValidatorsAtom } from "slices/validators";
import { useLoadable } from "store/hooks";

type ValidatorAddress = string;

type UseStakeModuleProps = {
  accounts: readonly Account[];
};

//eslint-disable-next-line
export const useStakeModule = ({ accounts }: UseStakeModuleProps) => {
  const totalNam = useAtomValue(totalNamBalanceAtom);
  const myValidators = useLoadable(fetchMyValidatorsAtom, accounts);

  const [stakedAmountByAddress, setStakedAmountsByAddress] = useState<
    Record<ValidatorAddress, BigNumber>
  >({});

  const [updatedAmountByAddress, setUpdatedAmountByAddress] = useState<
    Record<ValidatorAddress, BigNumber>
  >({});

  const totalUpdatedAmount = BigNumber.sum(
    0,
    ...Object.values(updatedAmountByAddress)
  );

  const totalStakedAmount = BigNumber.sum(
    0,
    ...Object.values(stakedAmountByAddress)
  );

  const totalNamAfterStaking = BigNumber.max(
    totalNam.minus(totalUpdatedAmount),
    0
  );

  const totalAmountToDelegate =
    totalUpdatedAmount.lt(0) ? totalUpdatedAmount.abs() : new BigNumber(0);

  const onChangeValidatorAmount = (
    validator: Validator,
    amount: BigNumber
  ): void => {
    setUpdatedAmountByAddress((obj) => ({
      ...obj,
      [validator.address]: amount,
    }));
  };

  useEffect(() => {
    if (myValidators.state !== "hasData" || accounts.length === 0) return;

    const stakedAmounts: Record<ValidatorAddress, BigNumber> = {};
    for (const myValidator of myValidators.data) {
      stakedAmounts[myValidator.validator.address] =
        myValidator.stakedAmount || new BigNumber(0);
    }
    setStakedAmountsByAddress(stakedAmounts);
  }, [myValidators.state, accounts]);

  return {
    totalUpdatedAmount,
    totalNamAfterStaking,
    totalStakedAmount,
    totalAmountToDelegate,
    myValidators,
    stakedAmountByAddress,
    updatedAmountByAddress,
    onChangeValidatorAmount,
  };
};