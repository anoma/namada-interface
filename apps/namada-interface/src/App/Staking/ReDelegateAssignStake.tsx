import { ActionButton, Panel } from "@namada/components";
import { TransactionFees } from "App/Common/TransactionFees";
import BigNumber from "bignumber.js";
import { useValidatorFilter } from "hooks/useValidatorFilter";
import { useValidatorSorting } from "hooks/useValidatorSorting";
import { useState } from "react";
import { Validator } from "slices/validators";
import { ReDelegateTable } from "./ReDelegateTable";
import { ValidatorFilterNav } from "./ValidatorFilterNav";

type ReDelegateAssignStakeProps = {
  validators: Validator[];
  amountRemovedByAddress: Record<string, BigNumber>;
  stakedAmountByAddress: Record<string, BigNumber>;
};

export const ReDelegateAssignStake = ({
  validators,
  stakedAmountByAddress,
  amountRemovedByAddress,
}: ReDelegateAssignStakeProps): JSX.Element => {
  const [filter, setFilter] = useState<string>("");
  const [onlyMyValidators, setOnlyMyValidators] = useState(false);
  const [seed, setSeed] = useState(Math.random());
  const [assignedAmounts, setAssignedAmounts] = useState<
    Record<string, BigNumber>
  >({});
  const onChangeValidatorAmount = (): void => {};

  const filteredValidators = useValidatorFilter({
    validators,
    myValidatorsAddresses: Array.from(
      new Set([
        ...Object.keys(stakedAmountByAddress),
        ...Object.keys(assignedAmounts),
      ])
    ),
    searchTerm: filter,
    onlyMyValidators,
  });

  const sortedValidators = useValidatorSorting({
    validators: filteredValidators,
    updatedAmountByAddress: assignedAmounts,
    seed,
  });

  return (
    <>
      <Panel className="grid grid-rows-[max-content_auto] overflow-hidden w-full rounded-md relative">
        <ValidatorFilterNav
          validators={validators}
          updatedAmountByAddress={assignedAmounts}
          stakedAmountByAddress={stakedAmountByAddress}
          onChangeSearch={(value: string) => setFilter(value)}
          onlyMyValidators={onlyMyValidators}
          onFilterByMyValidators={setOnlyMyValidators}
          onRandomize={() => setSeed(Math.random())}
        />
        {Object.keys(stakedAmountByAddress).length > 0 && (
          <ReDelegateTable
            validators={sortedValidators}
            updatedAmountByAddress={assignedAmounts}
            stakedAmountByAddress={stakedAmountByAddress}
            onChangeValidatorAmount={onChangeValidatorAmount}
            renderInfoColumn={() => <></>}
          />
        )}
      </Panel>
      <div className="relative">
        <ActionButton
          size="sm"
          color="white"
          borderRadius="sm"
          className="mt-2 w-1/4 mx-auto"
        >
          Re-Delegate
        </ActionButton>
        <TransactionFees
          className="absolute right-4 top-1/2 -translate-y-1/2"
          numberOfTransactions={Object.keys(assignedAmounts).length}
        />
      </div>
    </>
  );
};
