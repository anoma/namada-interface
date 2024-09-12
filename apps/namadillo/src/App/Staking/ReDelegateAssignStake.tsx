import { ActionButton, Panel } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { TransactionFees } from "App/Common/TransactionFees";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useValidatorFilter } from "hooks/useValidatorFilter";
import { useValidatorSorting } from "hooks/useValidatorSorting";
import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  GasConfig,
  RedelegateChange,
  Validator,
  ValidatorFilterOptions,
} from "types";
import { ReDelegateTable } from "./ReDelegateTable";
import { ValidatorFilterNav } from "./ValidatorFilterNav";

type Validation =
  | "NoInput"
  | "NotAllAssigned"
  | "TooMuchAssigned"
  | "NoRedelegateChanges"
  | "Valid";

const validate = (
  assignedAmountsByAddress: Record<string, BigNumber>,
  totalAssignedAmounts: BigNumber,
  totalToRedelegate: BigNumber,
  redelegateChanges: RedelegateChange[]
): Validation => {
  if (Object.keys(assignedAmountsByAddress).length === 0) {
    return "NoInput";
  } else if (totalAssignedAmounts.isLessThan(totalToRedelegate)) {
    return "NotAllAssigned";
  } else if (totalAssignedAmounts.isGreaterThan(totalToRedelegate)) {
    return "TooMuchAssigned";
  } else if (redelegateChanges.length === 0) {
    return "NoRedelegateChanges";
  } else {
    return "Valid";
  }
};

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
  redelegateChanges: RedelegateChange[];
  gasConfig: GasConfig | undefined;
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
  redelegateChanges,
  gasConfig,
}: ReDelegateAssignStakeProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [validatorFilter, setValidatorFilter] =
    useState<ValidatorFilterOptions>("all");
  const [onlyMyValidators, setOnlyMyValidators] = useState(false);
  const seed = useRef(Math.random());

  const filteredValidators = useValidatorFilter({
    validators,
    myValidatorsAddresses: Array.from(
      new Set([
        ...Object.keys(stakedAmountByAddress),
        ...Object.keys(assignedAmountsByAddress),
      ])
    ),
    searchTerm,
    validatorFilter,
    onlyMyValidators,
  });

  const sortedValidators = useValidatorSorting({
    validators: filteredValidators,
    updatedAmountByAddress: assignedAmountsByAddress,
    seed: seed.current,
  });

  const validation = validate(
    assignedAmountsByAddress,
    totalAssignedAmounts,
    totalToRedelegate,
    redelegateChanges
  );

  const renderNewTotalStakeAmount = (validator: Validator): JSX.Element => {
    const stakedAmount =
      stakedAmountByAddress[validator.address] ?? new BigNumber(0);

    const amountRemoved =
      amountsRemovedByAddress[validator.address] ?? new BigNumber(0);

    const updatedAmount =
      assignedAmountsByAddress[validator.address] ?? new BigNumber(0);

    const newAmount = stakedAmount.minus(amountRemoved).plus(updatedAmount);

    return (
      <>
        {updatedAmount.gt(0) && (
          <span
            className={twMerge(
              clsx("text-neutral-500 text-sm", {
                "text-orange": newAmount?.lte(stakedAmount),
                "text-success": newAmount?.gt(stakedAmount),
                "text-fail": validation === "TooMuchAssigned",
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
          validatorFilter={validatorFilter}
          onChangeValidatorFilter={setValidatorFilter}
          onChangeSearch={(value: string) => setSearchTerm(value)}
          onlyMyValidators={onlyMyValidators}
          onFilterByMyValidators={setOnlyMyValidators}
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
      <div className="relative grid grid-cols-[1fr_25%_1fr] items-center">
        <SubmitButton
          validation={validation}
          isPerformingRedelegation={isPerformingRedelegation}
        />
        {gasConfig && (
          <TransactionFees
            className="justify-self-end px-4"
            gasConfig={gasConfig}
          />
        )}
      </div>
    </>
  );
};

const SubmitButton: React.FC<{
  validation: Validation;
  isPerformingRedelegation: boolean;
}> = ({ validation, isPerformingRedelegation }) => {
  const disabled = validation !== "Valid" || isPerformingRedelegation;

  const text =
    validation === "TooMuchAssigned" ? "Too much stake assigned"
    : validation === "NoRedelegateChanges" ? "No redelegate changes"
    : isPerformingRedelegation ? "Processing..."
    : "Redelegate";

  return (
    <ActionButton
      type="submit"
      size="sm"
      backgroundColor="white"
      className="mt-2 col-start-2"
      disabled={disabled}
    >
      {text}
    </ActionButton>
  );
};
