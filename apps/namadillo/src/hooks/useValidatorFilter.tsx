import { ValidatorStatus } from "@anomaorg/namada-indexer-client";
import { useMemo } from "react";
import { Validator, ValidatorFilterOptions } from "types";

export type useValidatorFilterProps = {
  validators: Validator[];
  myValidatorsAddresses: string[];
  searchTerm: string;
  validatorFilter?: ValidatorFilterOptions;
  onlyMyValidators: boolean;
};

export const satisfiesSearchFilter = (
  validator: Validator,
  search: string
): boolean => {
  if (!search) return true;
  const preparedSearch = search.toLowerCase().trim();
  return (
    validator.address.toLowerCase().indexOf(preparedSearch) > -1 ||
    (validator.alias ?
      validator.alias.toLowerCase().indexOf(preparedSearch) > -1
    : false)
  );
};

export const satisfiesValidatorFilter = (
  validator: Validator,
  filter: ValidatorFilterOptions
): boolean => {
  if (filter === "all") return true;

  const activeTypes: Partial<ValidatorStatus>[] = [
    "consensus",
    "belowCapacity",
    "belowThreshold",
  ];

  if (filter === "active") {
    return activeTypes.includes(validator.status);
  }

  return filter === validator.status;
};

export const useValidatorFilter = ({
  validators,
  myValidatorsAddresses,
  searchTerm,
  validatorFilter = "all",
  onlyMyValidators,
}: useValidatorFilterProps): Validator[] => {
  return useMemo(() => {
    return validators.filter((v) => {
      if (!satisfiesSearchFilter(v, searchTerm)) return false;
      if (!satisfiesValidatorFilter(v, validatorFilter)) return false;

      if (onlyMyValidators) {
        return myValidatorsAddresses.indexOf(v.address) >= 0;
      }

      return true;
    });
  }, [validators, searchTerm, validatorFilter, onlyMyValidators]);
};
