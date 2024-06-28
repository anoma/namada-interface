import BigNumber from "bignumber.js";
import { useMemo } from "react";
import { Validator } from "types";

type useValidatorSortingProps = {
  validators: Validator[];
  seed: number;
  updatedAmountByAddress: Record<string, BigNumber>;
};

export const useValidatorSorting = ({
  validators,
  seed,
  updatedAmountByAddress,
}: useValidatorSortingProps): Validator[] => {
  return useMemo(() => {
    return validators
      .map((v) => ({ value: v, sort: Math.random() }))
      .sort((validator1, validator2) => {
        const v1IsUpdated = !!updatedAmountByAddress[validator1.value.address];
        const v2IsUpdated = !!updatedAmountByAddress[validator2.value.address];

        // Then addresses that were updated (increased / decreased staking)
        if (v1IsUpdated && !v2IsUpdated) return -1;
        if (!v1IsUpdated && v2IsUpdated) return 1;

        return validator1.sort - validator2.sort;
      })
      .map(({ value }) => value);
  }, [validators, seed]);
};
