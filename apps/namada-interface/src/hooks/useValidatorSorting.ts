import BigNumber from "bignumber.js";
import { useMemo } from "react";
import { Validator } from "slices/validators";

type useValidatorSortingProps = {
  validators: Validator[];
  stakedAmountByAddress: Record<string, BigNumber>;
  updatedAmountByAddress: Record<string, BigNumber>;
};

export const useValidatorSorting = ({
  validators,
  stakedAmountByAddress,
  updatedAmountByAddress,
}: useValidatorSortingProps): Validator[] => {
  return useMemo(() => {
    return validators
      .map((v) => ({ value: v, sort: Math.random() }))
      .sort((validator1, validator2) => {
        const v1HasStake = !!stakedAmountByAddress[validator1.value.address];
        const v2HasStake = !!stakedAmountByAddress[validator2.value.address];
        const v1IsUpdated = !!updatedAmountByAddress[validator1.value.address];
        const v2IsUpdated = !!updatedAmountByAddress[validator2.value.address];

        // Prioritizing validators with stake
        if (v1HasStake && !v2HasStake) return -1;
        if (!v1HasStake && v2HasStake) return 1;

        // Then addresses that were updated (increased / decreased staking)
        if (v1IsUpdated && !v2IsUpdated) return -1;
        if (!v1IsUpdated && v2IsUpdated) return 1;

        return validator1.sort - validator2.sort;
      })
      .map(({ value }) => value);
  }, [validators, stakedAmountByAddress]);
};
