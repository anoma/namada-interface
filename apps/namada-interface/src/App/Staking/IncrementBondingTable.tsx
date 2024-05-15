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
  updatedAmountByAddress: Record<string, BigNumber>;
  stakedAmountByAddress: Record<string, BigNumber>;
  onChangeValidatorAmount: (validator: Validator, amount?: BigNumber) => void;
  resultsPerPage?: number;
};

export const IncrementBondingTable = ({
  validators,
  updatedAmountByAddress,
  stakedAmountByAddress,
  onChangeValidatorAmount,
  resultsPerPage = 100,
}: IncrementBondingTableProps): JSX.Element => {
  const headers = [
    { children: "Validator", sortable: true },
    "Amount to Stake",
    {
      children: (
        <div className="leading-tight">
          Stake{" "}
          <small className="block text-xs text-neutral-500">New Stake</small>
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
    const amountToStake =
      updatedAmountByAddress[validator.address] ?? new BigNumber(0);
    const hasStakedAmount = stakedAmount.gt(0);
    const hasNewAmounts = amountToStake.gt(0);

    const newRow = {
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
            placeholder="Select to increase stake"
            className={twMerge(
              clsx("[&_input]:border-neutral-500 [&_input]:py-2 [&>div]:my-0", {
                "[&_input]:border-yellow [&_input]:bg-yellow-950":
                  hasNewAmounts,
              })
            )}
            value={updatedAmountByAddress[validator.address]}
            onChange={(e) => onChangeValidatorAmount(validator, e.target.value)}
            data-validator-input={validator.address}
          />
          <span
            className={clsx(
              "absolute flex items-center right-2 top-[0.6em]",
              "text-neutral-500 text-sm"
            )}
          >
            NAM
          </span>
        </div>,

        // Current Stake / New Stake
        {
          render: () => (
            <div
              key={`increment-bonding-current-stake`}
              className="text-right leading-tight min-w-[12ch]"
            >
              <span className="block">
                <NamCurrency amount={stakedAmount ?? 0} />
              </span>
              {hasNewAmounts && (
                <span
                  className={clsx("text-neutral-500 text-sm", {
                    "text-yellow": hasNewAmounts,
                  })}
                >
                  <NamCurrency amount={amountToStake.plus(stakedAmount)} />
                </span>
              )}
            </div>
          ),
        },

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

    return newRow;
  };

  return (
    <ValidatorsTable
      id="increment-bonding-table"
      tableClassName="flex-1 overflow-auto mt-2"
      validatorList={validators}
      updatedAmountByAddress={updatedAmountByAddress}
      headers={headers}
      renderRow={renderRow}
      resultsPerPage={resultsPerPage}
    />
  );
};
