import { Account } from "@namada/types";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { totalNamBalanceAtom } from "slices/accounts";
import { Validator, myValidatorsAtom } from "slices/validators";
import { ChangeInStakingPosition } from "types/staking";
import { ValidatorAddress } from "types/validators";

type UseStakeModuleProps = {
  accounts: readonly Account[];
};

//eslint-disable-next-line
export const useStakeModule = ({ accounts }: UseStakeModuleProps) => {
  const totalNam = useAtomValue(totalNamBalanceAtom).data || BigNumber(0);
  const myValidators = useAtomValue(myValidatorsAtom);

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
    amount: BigNumber | undefined
  ): void => {
    setUpdatedAmountByAddress((obj: Record<ValidatorAddress, BigNumber>) => {
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

  const parseUpdatedAmounts = (): ChangeInStakingPosition[] => {
    return Object.keys(updatedAmountByAddress).map((validatorAddress) => ({
      validatorId: validatorAddress,
      amount: updatedAmountByAddress[validatorAddress],
    }));
  };

  useEffect(() => {
    if (!myValidators.isSuccess || accounts.length === 0) return;

    const stakedAmounts: Record<ValidatorAddress, BigNumber> = {};
    for (const myValidator of myValidators.data) {
      stakedAmounts[myValidator.validator.address] =
        myValidator.stakedAmount || new BigNumber(0);
    }
    setStakedAmountsByAddress(stakedAmounts);
  }, [myValidators, accounts]);

  return {
    totalUpdatedAmount,
    totalNamAfterStaking,
    totalStakedAmount,
    totalAmountToDelegate,
    parseUpdatedAmounts,
    myValidators,
    stakedAmountByAddress,
    updatedAmountByAddress,
    onChangeValidatorAmount,
  };
};
