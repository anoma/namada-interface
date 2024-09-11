import { TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { NamCurrency } from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";
import { useValidatorTableSorting } from "hooks/useValidatorTableSorting";
import { Validator } from "types";
import { AmountField } from "./AmountField";
import { ValidatorCard } from "./ValidatorCard";
import { ValidatorsTable } from "./ValidatorsTable";

type IncrementBondingTableProps = {
  validators: Validator[];
  updatedAmountByAddress: Record<string, BigNumber | undefined>;
  stakedAmountByAddress: Record<string, BigNumber>;
  renderInfoColumn: (validator: Validator) => React.ReactNode;
  forceTextfield?: boolean;
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
  forceTextfield = false,
}: IncrementBondingTableProps): JSX.Element => {
  const { sortableColumns, sortedValidators } = useValidatorTableSorting({
    validators,
    stakedAmountByAddress,
  });

  const headers = [
    { children: "Validator" },
    "Amount to Redelegate",
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
      ...sortableColumns["stakedAmount"],
    },
    {
      children: "Voting Power",
      className: "text-right",
      ...sortableColumns["votingPowerInNAM"],
    },
    {
      children: "Commission",
      className: "text-right",
      ...sortableColumns["commission"],
    },
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
        <ValidatorCard
          key={`increment-bonding-alias-${validator.address}`}
          validator={validator}
          hasStake={hasStakedAmount}
        />,

        // Amount Text input
        <div
          key={`increment-bonding-new-amounts-${validator.address}`}
          className="relative"
        >
          <AmountField
            placeholder="Select to enter stake"
            value={updatedAmountByAddress[validator.address]}
            updated={hasNewAmounts}
            forceActive={forceTextfield}
            validator={validator}
            data-validator-input={validator.address}
            hasStakedAmounts={stakedAmountByAddress[validator.address]?.gt(0)}
            onChange={(e) => onChangeValidatorAmount(validator, e.target.value)}
            displayCurrencyIndicator={hasNewAmounts}
          />
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
            <NamCurrency amount={validator.votingPowerInNAM} />
          )}
          <span className="text-neutral-600 text-sm">
            {formatPercentage(BigNumber(validator.votingPowerPercentage || 0))}
          </span>
        </div>,

        // Commission
        <div
          key={`commission-${validator.uuid}`}
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
      validatorList={sortedValidators}
      updatedAmountByAddress={updatedAmountByAddress}
      headers={headers}
      renderRow={renderRow}
    />
  );
};
