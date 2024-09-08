import { Stack } from "@namada/components";
import { Search } from "App/Common/Search";
import BigNumber from "bignumber.js";
import { Validator, ValidatorFilterOptions } from "types";
import { MyValidatorsFilter } from "./MyValidatorsFilter";
import { QuickAccessList } from "./QuickAccessList";

type Props = {
  validators: Validator[];
  stakedAmountByAddress: Record<string, BigNumber>;
  updatedAmountByAddress: Record<string, BigNumber>;
  onChangeSearch: (searchStr: string) => void;
  onChangeValidatorFilter: (filter: ValidatorFilterOptions) => void;
  validatorFilter: ValidatorFilterOptions;
  onFilterByMyValidators: (showMyValidators: boolean) => void;
  onlyMyValidators: boolean;
};

export const ValidatorFilterNav = ({
  validators,
  stakedAmountByAddress,
  updatedAmountByAddress,
  onChangeSearch,
  onChangeValidatorFilter,
  validatorFilter,
  onFilterByMyValidators,
  onlyMyValidators,
}: Props): JSX.Element => {
  // this is super ugly :(
  const focusOnValidator = (validator: Validator): void => {
    setTimeout(() => {
      const input = document.querySelector(
        `[data-validator-input="${validator.address}"]`
      );
      if (input) {
        (input as HTMLInputElement).focus();
      }
    }, 100);
  };

  return (
    <Stack
      direction="horizontal"
      gap={2}
      className="w-full items-center mb-2 flex-wrap"
    >
      <div className="w-[300px]">
        <Search
          onChange={(value: string) => onChangeSearch(value)}
          placeholder="Search Validator"
        />
      </div>
      <MyValidatorsFilter
        onChangeFilter={onChangeValidatorFilter}
        filter={validatorFilter}
        onToggleMyValidatorsFilterActive={onFilterByMyValidators}
        myValidatorsFilterActive={onlyMyValidators}
      />
      <QuickAccessList
        validators={validators}
        onClick={(validator: Validator) => {
          onFilterByMyValidators(true);
          focusOnValidator(validator);
        }}
        updatedAmountByAddress={updatedAmountByAddress}
        stakedAmountByAddress={stakedAmountByAddress}
      />
    </Stack>
  );
};
