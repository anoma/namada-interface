import { useMemo } from "react";
import { Validator } from "slices/validators";

type Props = {
  validators: Validator[];
  myValidatorsAddresses: string[];
  searchTerm: string;
  onlyMyValidators: boolean;
};

const filterValidators = (validator: Validator, search: string): boolean => {
  if (!search) return true;
  const preparedSearch = search.toLowerCase().trim();
  return (
    validator.address.toLowerCase().indexOf(preparedSearch) > -1 ||
    validator.alias.toLowerCase().indexOf(preparedSearch) > -1
  );
};

const useValidatorFilter = ({
  validators,
  myValidatorsAddresses,
  searchTerm,
  onlyMyValidators,
}: Props): Validator[] => {
  return useMemo(() => {
    return validators
      .filter((v) => {
        const keep = filterValidators(v, searchTerm);
        if (keep && onlyMyValidators) {
          return myValidatorsAddresses.indexOf(v.address) >= 0;
        }
        return keep;
      })
      .map((v) => ({ value: v, sort: Math.random() }))
      .sort((validator1, validator2) => {
        const v1HasStake = myValidatorsAddresses.includes(
          validator1.value.address
        );

        const v2HasStake = myValidatorsAddresses.includes(
          validator2.value.address
        );

        if (v1HasStake && !v2HasStake) return -1;
        if (!v1HasStake && v2HasStake) return 1;

        return validator1.sort - validator2.sort;
      })
      .map(({ value }) => value);
  }, [validators, searchTerm, onlyMyValidators]);
};

export default useValidatorFilter;
