import { AmountInput, Currency, TableRow } from "@namada/components";
import { CurrencyType, formatPercentage } from "@namada/utils";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { MyValidator, Validator } from "slices/validators";
import ValidatorName from "./ValidatorName";
import ValidatorsTable from "./ValidatorsTable";

type UnstakeBondingTableProps = {
  myValidators: MyValidator[];
  selectedFiatCurrency: CurrencyType;
  selectedCurrencyExchangeRate: number;
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
    <div
      key={`amount-to-unstake-th`}
      className="flex items-center justify-between"
    >
      <span>Amount to Unstake</span>
      <span className="text-xs">/Current Stake</span>
    </div>,
    <div key={`unstake-voting-power`} className="text-right">
      Voting Power
    </div>,
    <div key={`unstake-commission`} className="text-right">
      Commission
    </div>,
  ];

  const renderRows = (validator: Validator): TableRow => {
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
            value={amountToUnstake}
            onChange={(e) =>
              onChangeValidatorAmount(
                validator,
                e.target.value || new BigNumber(0)
              )
            }
            className={twMergeHH(
              clsx(
                "[&_input]:border-neutral-500 [&_input]:py-2.5 [&>div]:my-0",
                {
                  "[&_input]:!border-pink [&_input]:text-pink": hasNewAmounts,
                }
              )
            )}
          />
          <span className="absolute h-full flex items-center right-4 top-0 text-neutral-500 text-sm">
            /&nbsp;
            <Currency
              amount={stakedAmount}
              currencyPosition="right"
              spaceAroundSign={true}
              currency="nam"
            />
          </span>
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
        renderRows={renderRows}
        filter=""
      />
    </div>
  );
};
