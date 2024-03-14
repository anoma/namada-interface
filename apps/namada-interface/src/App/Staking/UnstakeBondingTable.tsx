import { AmountInput, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import NamCurrency from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { MyValidator, Validator } from "slices/validators";
import { twMerge } from "tailwind-merge";
import ValidatorName from "./ValidatorName";
import ValidatorsTable from "./ValidatorsTable";

type UnstakeBondingTableProps = {
  myValidators: MyValidator[];
  updatedAmountByAddress: Record<string, BigNumber>;
  stakedAmountByAddress: Record<string, BigNumber>;
  onChangeValidatorAmount: (validator: Validator, amount: BigNumber) => void;
};

export const UnstakeBondingTable = ({
  myValidators,
  updatedAmountByAddress,
  stakedAmountByAddress,
  onChangeValidatorAmount,
}: UnstakeBondingTableProps): JSX.Element => {
  const headers = [
    { children: "Validator", sortable: true },
    "Amount to Unstake",
    <div key={`unstake-new-total`} className="text-right">
      <span className="block">Stake</span>
      <small className="text-xs text-neutral-500 block">New total Stake</small>
    </div>,
    <div key={`unstake-voting-power`} className="text-right">
      Voting Power
    </div>,
    <div key={`unstake-commission`} className="text-right">
      Commission
    </div>,
  ];

  const renderRow = (validator: Validator): TableRow => {
    const stakedAmount =
      stakedAmountByAddress[validator.address] ?? new BigNumber(0);

    const amountToUnstake =
      updatedAmountByAddress[validator.address] ?? new BigNumber(0);

    const hasNewAmounts = amountToUnstake.gt(0);

    return {
      className: "",
      cells: [
        // Validator Alias + Avatar
        <ValidatorName
          key={`validator-name-${validator.address}`}
          validator={validator}
          hasStake={true}
        />,

        // Amount Text input
        <div
          key={`increment-bonding-new-amounts-${validator.address}`}
          className="relative"
        >
          <AmountInput
            placeholder="Select to increase stake"
            value={amountToUnstake.eq(0) ? undefined : amountToUnstake}
            onChange={(e) =>
              onChangeValidatorAmount(
                validator,
                e.target.value || new BigNumber(0)
              )
            }
            className={twMerge(
              clsx(
                "[&_input]:border-neutral-500 [&_input]:py-2.5 [&>div]:my-0",
                {
                  "[&_input]:!border-pink [&_input]:text-pink": hasNewAmounts,
                }
              )
            )}
          />
        </div>,

        <div
          key={`increment-bonding-new-totals-${validator.address}`}
          className="text-right leading-tight"
        >
          <span className="block text-white">
            <NamCurrency amount={stakedAmount} />
          </span>
          {hasNewAmounts && (
            <span className="text-orange text-sm">
              =
              <NamCurrency amount={stakedAmount.minus(amountToUnstake)} />
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
    <div>
      <ValidatorsTable
        id="increment-bonding-table"
        tableClassName="mt-2"
        validatorList={myValidators.map((mv) => mv.validator)}
        headers={headers}
        renderRow={renderRow}
      />
    </div>
  );
};
