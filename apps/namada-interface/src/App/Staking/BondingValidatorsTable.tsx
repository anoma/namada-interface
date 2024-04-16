import { AmountInput, Checkbox, StyledTable } from "@namada/components";
import { Tokens } from "@namada/types";
import { formatPercentage } from "@namada/utils";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useState } from "react";
import { GoInfo } from "react-icons/go";
import { Validator } from "slices/validators";

type BondingValidatorsTableProps = {
  validators: Validator[];
};

type ValidatorAddress = string;

export const BondingValidatorsTable: React.FC<BondingValidatorsTableProps> = ({
  validators,
}) => {
  const [selectedValidators, setSelectedValidators] = useState<
    Record<ValidatorAddress, Validator>
  >({});

  const [stakedAmounts, setStakedAmounts] = useState<
    Record<ValidatorAddress, BigNumber>
  >({});

  const [newAmountsToStake, setNewAmountsToStake] = useState<
    Record<ValidatorAddress, BigNumber>
  >({});

  const addValidator = (validator: Validator): void => {
    setSelectedValidators((validators) => ({
      ...validators,
      [validator.address]: validator,
    }));
  };

  const removeValidator = (validator: Validator): void => {
    setSelectedValidators((validators) => {
      const { [validator.address]: _, ...rest } = validators;
      return rest;
    });

    setNewAmountsToStake((amounts) => {
      const { [validator.address]: _, ...rest } = amounts;
      return rest;
    });
  };

  const toggleValidator = (validator: Validator): void => {
    if (selectedValidators.hasOwnProperty(validator.address)) {
      removeValidator(validator);
    } else {
      addValidator(validator);
    }
  };

  const handleAmountChange = (
    validator: Validator,
    value?: BigNumber
  ): void => {
    if (!value) {
      removeValidator(validator);
      return;
    }

    addValidator(validator);
    setNewAmountsToStake((amounts) => ({
      ...amounts,
      [validator.address]: value,
    }));
  };

  const handleCheckboxClick = (
    e: React.ChangeEvent<HTMLInputElement>,
    validator: Validator
  ): void => {
    toggleValidator(validator);

    if (e.target.checked) {
      // We have too many elements to use refs
      const el = document.getElementById(getAmountInputId(validator.address));
      if (el) el.focus();
    }
  };

  const getAmountInputId = (address: string): string =>
    `amount-input-${address}`;

  const headers = [
    { children: "Validator", colSpan: 3 },
    "Amount to stake",
    { children: "Voting Power", className: "text-right" },
    { children: "Comission", className: "text-right" },
    "",
  ];

  const rows = validators.map((validator) => {
    const isSelected = selectedValidators.hasOwnProperty(validator.address);
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

        // Icon
        <img
          src={validator.imageUrl}
          key={`bonding-validators-icon-${validator.uuid}`}
        />,

        // Alias
        validator.alias,

        // Amount to stake
        <AmountInput
          id={getAmountInputId(validator.address)}
          key={`bonding-validators-amount-${validator.uuid}`}
          className={clsx(
            "amountInput [&_input]:text-sm [&_input]:border-neutral-600 [&_input]:py-2.5",
            "[&_input]:rounded-sm",
            {
              "[&_input]:border-yellow": isSelected,
            }
          )}
          value={newAmountsToStake[validator.address]}
          placeholder="Select to enter stake"
          maxDecimalPlaces={Tokens.NAM.decimals}
          onChange={(e) => handleAmountChange(validator, e.target.value)}
          onFocus={() => addValidator(validator)}
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
  });

  return (
    <div>
      <StyledTable
        containerClassName="max-h-[50vh]" // TODO: this seems wrong
        tableProps={{ className: "w-full" }}
        headProps={{ className: "text-white" }}
        id="bonding-validators"
        headers={headers}
        rows={rows}
      />
    </div>
  );
};
