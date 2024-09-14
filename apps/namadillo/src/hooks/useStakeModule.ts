import { Account } from "@namada/types";
import { accountBalanceAtom } from "atoms/accounts";
import { myValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { AddressBalance, Validator } from "types";

type UseStakeModuleProps = {
  account: Account | undefined;
};

//eslint-disable-next-line
export const useStakeModule = ({ account }: UseStakeModuleProps) => {
  const totalNam = useAtomValue(accountBalanceAtom).data || BigNumber(0);
  const myValidators = useAtomValue(myValidatorsAtom);

  const [stakedAmountByAddress, setStakedAmountsByAddress] =
    useState<AddressBalance>({});

  const [updatedAmountByAddress, setUpdatedAmountByAddress] =
    useState<AddressBalance>({});

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
    amount: BigNumber | undefined
  ): void => {
    setUpdatedAmountByAddress((obj: AddressBalance) => {
      const newObj = {
        ...obj,
      };

      if (!amount) {
        if (newObj.hasOwnProperty(validator.address)) {
          delete newObj[validator.address];
        }
      } else {
        newObj[validator.address] = amount;
      }

      return newObj;
    });
  };

  useEffect(() => {
    if (!myValidators.isSuccess || !account) return;

    const stakedAmounts: AddressBalance = {};
    for (const myValidator of myValidators.data) {
      stakedAmounts[myValidator.validator.address] =
        myValidator.stakedAmount || new BigNumber(0);
    }
    setStakedAmountsByAddress(stakedAmounts);
  }, [myValidators, account]);

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
