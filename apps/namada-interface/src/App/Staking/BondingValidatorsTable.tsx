import BigNumber from "bignumber.js";
import clsx from "clsx";
import { GoInfo } from "react-icons/go";

import { AmountInput, Checkbox, Panel, StyledTable } from "@namada/components";
import { Tokens } from "@namada/types";
import { formatPercentage } from "@namada/utils";
import { Validator } from "slices/validators";

type BondingValidatorsTableProps = {
  validators: Validator[];
};

export const BondingValidatorsTable: React.FC<BondingValidatorsTableProps> = ({
  validators,
}) => {
  const headers = [
    { children: "Validator", colSpan: 3 },
    "Amount to stake",
    { children: "Voting Power", className: "text-right" },
    { children: "Comission", className: "text-right" },
    "",
  ];

  const rows = validators.map((validator) => ({
    cells: [
      // Checkbox
      <Checkbox key={`bonding-validators-checkbox-${validator.uuid}`} />,

      // Icon
      <img
        src={validator.imageUrl}
        key={`bonding-validators-icon-${validator.uuid}`}
      />,

      // Alias
      validator.alias,

      // Amount to stake
      <AmountInput
        key={`bonding-validators-amount-${validator.uuid}`}
        className={clsx(
          "[&_input]:text-sm [&_input]:border-neutral-600 [&_input]:py-2.5",
          "[&_input]:rounded-sm"
        )}
        placeholder="Select to enter stake"
        maxDecimalPlaces={Tokens.NAM.decimals}
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
          {formatPercentage(BigNumber(validator.votingPowerInPercentage || 0))}
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
  }));

  return (
    <Panel className="w-full rounded-md">
      <StyledTable
        containerClassName="max-h-[50vh]" // TODO: this seems wrong
        tableProps={{ className: "w-full" }}
        headProps={{ className: "text-white" }}
        id="bonding-validators"
        headers={headers}
        rows={rows}
      />
    </Panel>
  );
};
