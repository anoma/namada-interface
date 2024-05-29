import { AmountInput, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { NamCurrency } from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { Validator } from "slices/validators";
import { twMerge } from "tailwind-merge";
import { ValidatorName } from "./ValidatorName";
import { ValidatorsTable } from "./ValidatorsTable";

type IncrementBondingTableProps = {
  validators: Validator[];
  updatedAmountByAddress: Record<string, BigNumber | undefined>;
  stakedAmountByAddress: Record<string, BigNumber>;
  renderInfoColumn: (validator: Validator) => React.ReactNode;
  onChangeValidatorAmount: (
    validator: Validator,
    amount: BigNumber | undefined
  ) => void;
};

export const ReDelegateTable = ({
  validators,
  updatedAmountByAddress,
  stakedAmountByAddress,
  renderInfoColumn,
  onChangeValidatorAmount,
}: IncrementBondingTableProps): JSX.Element => {
  const headers = [
    { children: "Validator", sortable: true },
    "Amount to Re-delegate",
    {
      children: (
        <div className="leading-tight">
          Stake{" "}
          <small className="block text-xs text-neutral-500">
            New total stake
          </small>
        </div>
      ),
      className: "text-right",
    },
    { children: "Voting Power", className: "text-right" },
    { children: "Commission", className: "text-right" },
  ];

  const renderRow = (validator: Validator): TableRow => {
    const stakedAmount =
      stakedAmountByAddress[validator.address] ?? new BigNumber(0);
    const updatedAmounts = updatedAmountByAddress[validator.address];
    const hasStakedAmount = stakedAmount ? stakedAmount.gt(0) : false;
    const hasNewAmounts = updatedAmounts ? updatedAmounts.gt(0) : false;

    return {
      className: "",
      cells: [
        // Validator Alias + Avatar
        <ValidatorName
          key={`increment-bonding-alias-${validator.address}`}
          validator={validator}
          hasStake={hasStakedAmount}
        />,

        // Amount Text input
        <div
          key={`increment-bonding-new-amounts-${validator.address}`}
          className="relative"
        >
          <AmountInput
            value={updatedAmountByAddress[validator.address]}
            onChange={(e) => onChangeValidatorAmount(validator, e.target.value)}
            placeholder="Select to enter stake"
            className={twMerge(
              clsx(
                "[&_input]:border-neutral-500 [&_input]:py-2.5 [&>div]:my-0",
                {
                  "[&_input]:border-yellow [&_input]:bg-yellow-950":
                    hasNewAmounts,
                }
              )
            )}
          />
          {hasNewAmounts && (
            <span className="absolute h-full flex items-center right-2 top-0 text-neutral-500 text-sm">
              NAM
            </span>
          )}
        </div>,

        <div
          key={`increment-bonding-current-stake`}
          className="text-right leading-tight"
        >
          <span className="block">
            <NamCurrency amount={stakedAmount} />
          </span>
          {renderInfoColumn(validator)}
        </div>,

        // Voting Power
        <div
          className="flex flex-col text-right leading-tight"
          key={`validator-voting-power-${validator.address}`}
        >
          {validator.votingPowerInNAM && (
            <span>{validator.votingPowerInNAM?.toString()} NAM</span>
          )}
          <span className="text-neutral-600 text-sm">
            {formatPercentage(BigNumber(validator.votingPowerPercentage || 0))}
          </span>
        </div>,

        // Commission
        <div
          key={`comission-${validator.uuid}`}
          className="text-right leading-tight"
        >
          {formatPercentage(validator.commission)}
        </div>,
      ],
    };
  };

  return (
    <ValidatorsTable
      id="increment-bonding-table"
      tableClassName="mt-2"
      validatorList={validators}
      updatedAmountByAddress={updatedAmountByAddress}
      headers={headers}
      renderRow={renderRow}
    />
  );
};
