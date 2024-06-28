import { ActionButton, Panel } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { TransactionFees } from "App/Common/TransactionFees";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useValidatorFilter } from "hooks/useValidatorFilter";
import { useValidatorSorting } from "hooks/useValidatorSorting";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Validator } from "types";
import { ReDelegateTable } from "./ReDelegateTable";
import { ValidatorFilterNav } from "./ValidatorFilterNav";

type ReDelegateAssignStakeProps = {
  validators: Validator[];
  amountsRemovedByAddress: Record<string, BigNumber>;
  assignedAmountsByAddress: Record<string, BigNumber>;
  stakedAmountByAddress: Record<string, BigNumber>;
  totalAssignedAmounts: BigNumber;
  totalToRedelegate: BigNumber;
  onChangeAssignedAmount: (
    validator: Validator,
    amount: BigNumber | undefined
  ) => void;
  isPerformingRedelegation: boolean;
};

export const ReDelegateAssignStake = ({
  validators,
  stakedAmountByAddress,
  amountsRemovedByAddress,
  totalToRedelegate,
  totalAssignedAmounts,
  assignedAmountsByAddress,
  onChangeAssignedAmount,
  isPerformingRedelegation,
}: ReDelegateAssignStakeProps): JSX.Element => {
  const [filter, setFilter] = useState<string>("");
  const [onlyMyValidators, setOnlyMyValidators] = useState(false);
  const [seed, setSeed] = useState(Math.random());

  const isAssigningValid = totalAssignedAmounts.lte(totalToRedelegate);
  const hasUpdatedAmounts = Object.keys(assignedAmountsByAddress).length > 0;
  const hasInvalidDistribution =
    !isAssigningValid || !totalAssignedAmounts.minus(totalToRedelegate).eq(0);

  // TODO: this is just an estimate, but we should calculate it in a better way
  const numberOfTransactions = Math.max(
    Object.keys(assignedAmountsByAddress).length,
    Object.keys(amountsRemovedByAddress).length
  );

  const filteredValidators = useValidatorFilter({
    validators,
    myValidatorsAddresses: Array.from(
      new Set([
        ...Object.keys(stakedAmountByAddress),
        ...Object.keys(assignedAmountsByAddress),
      ])
    ),
    searchTerm: filter,
    onlyMyValidators,
  });

  const sortedValidators = useValidatorSorting({
    validators: filteredValidators,
    updatedAmountByAddress: assignedAmountsByAddress,
    seed,
  });

  const renderNewTotalStakeAmount = (validator: Validator): JSX.Element => {
    const stakedAmount =
      stakedAmountByAddress[validator.address] ?? new BigNumber(0);

    const amountRemoved =
      amountsRemovedByAddress[validator.address] ?? new BigNumber(0);

    const updatedAmount =
      assignedAmountsByAddress[validator.address] ?? new BigNumber(0);

    const newAmount = stakedAmount.minus(amountRemoved).plus(updatedAmount);
    const hasUpdatedAmount = updatedAmount ? updatedAmount.gt(0) : false;
    return (
      <>
        {hasUpdatedAmount && (
          <span
            className={twMerge(
              clsx("text-neutral-500 text-sm", {
                "text-orange": newAmount?.lte(stakedAmount),
                "text-success": newAmount?.gt(stakedAmount),
                "text-fail": !isAssigningValid,
              })
            )}
          >
            <NamCurrency amount={newAmount} />
          </span>
        )}
      </>
    );
  };

  return (
    <>
      <Panel className="grid grid-rows-[max-content_auto] overflow-hidden w-full rounded-md relative">
        <ValidatorFilterNav
          validators={validators}
          updatedAmountByAddress={assignedAmountsByAddress}
          stakedAmountByAddress={stakedAmountByAddress}
          onChangeSearch={(value: string) => setFilter(value)}
          onlyMyValidators={onlyMyValidators}
          onFilterByMyValidators={setOnlyMyValidators}
          onRandomize={() => setSeed(Math.random())}
        />
        {Object.keys(stakedAmountByAddress).length > 0 && (
          <ReDelegateTable
            validators={sortedValidators}
            updatedAmountByAddress={assignedAmountsByAddress}
            stakedAmountByAddress={stakedAmountByAddress}
            onChangeValidatorAmount={onChangeAssignedAmount}
            renderInfoColumn={renderNewTotalStakeAmount}
          />
        )}
      </Panel>
      <div className="relative">
        <ActionButton
          type="submit"
          size="sm"
          color="white"
          borderRadius="sm"
          className="mt-2 w-1/4 mx-auto"
          disabled={hasInvalidDistribution || isPerformingRedelegation}
        >
          {hasInvalidDistribution && hasUpdatedAmounts ?
            "Invalid distribution"
          : "Re-Delegate"}
        </ActionButton>
        <TransactionFees
          className="absolute right-4 top-1/2 -translate-y-1/2"
          numberOfTransactions={numberOfTransactions}
        />
      </div>
    </>
  );
};
