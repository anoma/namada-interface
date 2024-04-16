import BigNumber from "bignumber.js";
import clsx from "clsx";
import { GoInfo } from "react-icons/go";

import { AmountInput, Checkbox, Panel, StyledTable } from "@namada/components";
import { Tokens } from "@namada/types";
import { formatPercentage } from "@namada/utils";

export const BondingValidatorsTable: React.FC = ({}) => {
  // TODO: get validators from props
  const validators = [
    {
      alias: "Validator",
      address: "",
      homepageUrl: "",
      votingPowerInNAM: BigNumber(7_000_000),
      votingPowerInPercentage: BigNumber(0.06),
      commission: BigNumber(0.02),
      imageUrl: "url",
      uuid: "",
    },
  ];

  // TODO: probably shouldn't use the first two empty headers here
  const headers = [
    "Validator",
    "",
    "",
    "Amount to stake",
    <div className="text-right" key={`validator-voting-power-header`}>
      Voting Power
    </div>,
    <div className="text-right" key={`validator-commission-header`}>
      Commission
    </div>,
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
        id="bonding-validators"
        headers={headers}
        rows={rows}
      />
    </Panel>
  );
};
