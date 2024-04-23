import { AmountInput, Currency, TableRow } from "@namada/components";
import { CurrencyType, formatPercentage } from "@namada/utils";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { Validator } from "slices/validators";
import { twMerge } from "tailwind-merge";
import ValidatorName from "./ValidatorName";
import ValidatorsTable from "./ValidatorsTable";

type IncrementBondingTableProps = {
  filter: string;
  validators: Validator[];
  selectedFiatCurrency: CurrencyType;
  selectedCurrencyExchangeRate: number;
  updatedAmountByAddress: Record<string, BigNumber>;
  stakedAmountByAddress: Record<string, BigNumber>;
  onChangeValidatorAmount: (validator: Validator, amount: BigNumber) => void;
};

export const ReDelegateTable = ({
  filter = "",
  validators,
  updatedAmountByAddress,
  stakedAmountByAddress,
  onChangeValidatorAmount,
}: IncrementBondingTableProps): JSX.Element => {
  const headers = [
    { children: "Validator", sortable: true },
    "New staked amount",
    <div key={`increment-bonding-th-current-stake`} className="text-right">
      Stake
      <div className="text-xs text-neutral-500">Stake difference</div>
    </div>,
    <div key={`increment-bonding-th-voting-power`} className="text-right">
      Voting Power
    </div>,
    <div key={`increment-bonding-th-comission`} className="text-right">
      Commission
    </div>,
  ];

  const renderRows = (validator: Validator): TableRow => {
    const stakedAmount =
      stakedAmountByAddress[validator.address] ?? new BigNumber(0);
    const updatedAmounts =
      updatedAmountByAddress[validator.address] ?? new BigNumber(0);
    const hasStakedAmount = stakedAmount.gt(0);
    const hasNewAmounts = updatedAmounts.gt(0);

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
            placeholder="Select to enter stake"
            value={updatedAmounts.gt(0) ? updatedAmounts : stakedAmount}
            className={twMerge(
              clsx(
                "[&_input]:border-neutral-500 [&_input]:py-2.5 [&>div]:my-0",
                {
                  "[&_input]:border-yellow [&_input]:bg-yellow-950":
                    hasNewAmounts,
                }
              )
            )}
            onChange={(e) =>
              onChangeValidatorAmount(
                validator,
                e.target.value ?? new BigNumber(0)
              )
            }
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
            <Currency
              currency="nam"
              amount={stakedAmount ?? 0}
              currencyPosition="right"
              spaceAroundSign={true}
            />
          </span>
          {hasNewAmounts && (
            <span
              className={clsx("text-neutral-500 text-sm", {
                "text-intermediate": updatedAmounts.lt(stakedAmount),
              })}
            >
              {updatedAmounts.lt(stakedAmount) && "-"}
              <Currency
                currency="nam"
                amount={stakedAmount.minus(updatedAmounts).abs()}
                currencyPosition="right"
                spaceAroundSign={true}
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
    <div>
      <ValidatorsTable
        id="increment-bonding-table"
        tableClassName="mt-2"
        validatorList={validators}
        headers={headers}
        renderRows={renderRows}
        filter={filter}
      />
    </div>
  );
};
