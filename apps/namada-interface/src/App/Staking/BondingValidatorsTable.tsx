import { Checkbox, Stack, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import BigNumber from "bignumber.js";
import { GoInfo } from "react-icons/go";
import { Validator } from "slices/validators";
import { ValidatorAmountControl } from "./ValidatorAmountControl";
import ValidatorsTable from "./ValidatorsTable";

type ValidatorAddress = string;

type BondingValidatorsTableProps = {
  validators: Validator[];
  filter: string;
  selectedValidators: Record<ValidatorAddress, boolean>;
  newStakedAmountsByValidator: Record<ValidatorAddress, BigNumber>;
  stakedAmountsByValidator: Record<ValidatorAddress, BigNumber>;
  onRemoveValidator: (validator: Validator) => void;
  onAddValidator: (validator: Validator) => void;
  onChangeAmount: (validator: Validator, amount: BigNumber) => void;
};

export const BondingValidatorsTable: React.FC<BondingValidatorsTableProps> = ({
  onChangeAmount,
  onAddValidator,
  onRemoveValidator,
  validators,
  selectedValidators,
  filter,
  newStakedAmountsByValidator,
  stakedAmountsByValidator,
}) => {
  const handleCheckboxClick = (
    e: React.ChangeEvent<HTMLInputElement>,
    validator: Validator
  ): void => {
    if (e.target.checked) {
      onAddValidator(validator);
      if (stakedAmountsByValidator[validator.address]) {
        onChangeAmount(validator, stakedAmountsByValidator[validator.address]);
      }
    } else {
      onRemoveValidator(validator);
    }
  };

  const getAmountInputId = (address: string): string =>
    `amount-input-${address}`;

  const headers = [
    { children: "Validator", colSpan: 2 },
    "Amount to stake",
    { children: "Voting Power", className: "text-right" },
    { children: "Comission", className: "text-right" },
    "",
  ];

  const renderRows = (validator: Validator): TableRow => {
    const isSelected = selectedValidators[validator.address];
    return {
      cells: [
        // Checkbox
        <Checkbox
          key={`bonding-validators-checkbox-${validator.uuid}`}
          className="border-neutral-400"
          checkedClassName="border-yellow"
          onChange={(e) => handleCheckboxClick(e, validator)}
          checked={isSelected}
        />,

        // Icon + Alias
        <Stack
          key={`bonding-validators-alias-${validator.uuid}`}
          direction="horizontal"
          className="items-center"
          gap={6}
        >
          <img
            src={validator.imageUrl}
            className="rounded-full aspect-square max-w-12"
          />
          {validator.alias}
        </Stack>,

        <ValidatorAmountControl
          key={`bonding-validators-amount-${validator.uuid}`}
          inputId={getAmountInputId(validator.address)}
          validator={validator}
          isSelected={isSelected}
          stakedAmount={stakedAmountsByValidator[validator.address]}
          newStakedAmount={newStakedAmountsByValidator[validator.address]}
          onAmountChange={onChangeAmount}
          onRemoveValidator={onRemoveValidator}
          onAddValidator={onAddValidator}
        />,

        // Voting power
        <div
          className="flex flex-col text-right"
          key={`validator-voting-power-${validator.uuid}`}
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
          className="text-right"
          key={`bonding-validators-commission-${validator.uuid}`}
        >
          {formatPercentage(BigNumber(validator.commission))}
        </div>,

        // Info icon
        <GoInfo key={`bonding-validators-info-icon-${validator.uuid}`} />,
      ],
    };
  };

  return (
    <ValidatorsTable
      id="bonding-validators"
      headers={headers}
      validatorList={validators}
      renderRows={renderRows}
      filter={filter}
    />
  );
};
