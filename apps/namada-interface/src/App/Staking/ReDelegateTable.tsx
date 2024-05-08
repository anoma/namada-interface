import { AmountInput, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import NamCurrency from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { Validator } from "slices/validators";
import { twMerge } from "tailwind-merge";
import ValidatorName from "./ValidatorName";
import ValidatorsTable from "./ValidatorsTable";

type IncrementBondingTableProps = {
  validators: Validator[];
  updatedAmountByAddress: Record<string, BigNumber | undefined>;
  stakedAmountByAddress: Record<string, BigNumber>;
  onChangeValidatorAmount: (
    validator: Validator,
    amount: BigNumber | undefined
  ) => void;
};

export const ReDelegateTable = ({
  validators,
  updatedAmountByAddress,
  stakedAmountByAddress,
  onChangeValidatorAmount,
}: IncrementBondingTableProps): JSX.Element => {
  const headers = [
    { children: "Validator", sortable: true },
    "New staked amount",
    {
      children: (
        <div className="leading-tight">
          Stake{" "}
          <small className="block text-xs text-neutral-500">
            Stake difference
          </small>
        </div>
      ),
      className: "text-right",
    },
    { children: "Voting Power", className: "text-right" },
    { children: "Comission", className: "text-right" },
  ];

  const renderRow = (validator: Validator): TableRow => {
    const stakedAmount =
      stakedAmountByAddress[validator.address] ?? new BigNumber(0);
    const updatedAmounts = updatedAmountByAddress[validator.address];
    const hasStakedAmount = stakedAmount ? stakedAmount.gt(0) : false;
    const hasNewAmounts = updatedAmounts ? updatedAmounts.gte(0) : false;

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

        // Current Stake / New Stake
        <div
          key={`increment-bonding-current-stake`}
          className="text-right leading-tight"
        >
          <span className="block">
            <NamCurrency amount={stakedAmount ?? 0} />
          </span>
          {hasNewAmounts && (
            <span
              className={clsx("text-neutral-500 text-sm", {
                "text-orange": updatedAmounts?.lt(stakedAmount),
                "text-success": updatedAmounts?.gt(stakedAmount),
              })}
            >
              {updatedAmounts?.lt(stakedAmount) ? "-" : "+"}
              <NamCurrency
                amount={stakedAmount.minus(updatedAmounts || 0).abs()}
              />
            </span>
          )}
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

        // Comission
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
      headers={headers}
      renderRow={renderRow}
    />
  );
};
