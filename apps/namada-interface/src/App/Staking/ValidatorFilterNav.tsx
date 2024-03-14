import { ActionButton, Stack } from "@namada/components";
import BigNumber from "bignumber.js";
import { Validator } from "slices/validators";
import MyValidatorsFilter from "./MyValidatorsFilter";
import { QuickAccessList } from "./QuickAccessList";
import { ValidatorSearch } from "./ValidatorSearch";

type Props = {
  validators: Validator[];
  stakedAmountByAddress: Record<string, BigNumber>;
  updatedAmountByAddress: Record<string, BigNumber>;
  onChangeSearch: (searchStr: string) => void;
  onFilterByMyValidators: (showMyValidators: boolean) => void;
  onRandomize?: () => void;
  onlyMyValidators: boolean;
};

export const ValidatorFilterNav = ({
  validators,
  stakedAmountByAddress,
  updatedAmountByAddress,
  onChangeSearch,
  onFilterByMyValidators,
  onRandomize,
  onlyMyValidators,
}: Props): JSX.Element => {
  return (
    <Stack direction="horizontal" gap={2} className="w-full items-center mb-2">
      <div className="w-[300px]">
        <ValidatorSearch onChange={(value: string) => onChangeSearch(value)} />
      </div>
      <MyValidatorsFilter
        value={onlyMyValidators ? "my-validators" : "all"}
        onChange={(filter: string) =>
          onFilterByMyValidators(filter === "my-validators")
        }
      />
      <QuickAccessList
        validators={validators}
        updatedAmountByAddress={updatedAmountByAddress}
        stakedAmountByAddress={stakedAmountByAddress}
      />
      {onRandomize && (
        <ActionButton
          type="button"
          onClick={onRandomize}
          color="white"
          className="ml-auto w-auto px-8"
          size="sm"
          borderRadius="sm"
        >
          Randomise
        </ActionButton>
      )}
    </Stack>
  );
};
