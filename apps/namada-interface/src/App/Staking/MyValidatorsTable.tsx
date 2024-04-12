import { Currency, StyledTable } from "@namada/components";
import { formatPercentage, shortenAddress } from "@namada/utils";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { myValidatorsAtom } from "slices/validators";

export const MyValidatorsTable = (): JSX.Element => {
  const myValidators = useAtomValue(myValidatorsAtom);
  const head = [
    "My Validators",
    "Address",
    <div key="my-validators-vp" className="text-right">
      Voting Power
    </div>,
    <div key="my-validators-staked-amount" className="text-right">
      Staked Amount
    </div>,
    <div key="my-validators-comission" className="text-right">
      Comission
    </div>,
  ];

  const rows = myValidators.map((myValidator) => {
    const validator = myValidator.validator;
    return {
      className: "",
      cells: [
        // TODO: Update thumbnail
        validator.alias,
        shortenAddress(validator.address, 8, 8),
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
        <div key={`currency-${validator.uuid}`} className="text-right">
          <Currency
            currency="nam"
            amount={myValidator.stakedAmount || 0}
            currencyPosition="right"
            spaceAroundSign={true}
          />
        </div>,
        <div key={`comission-${validator.uuid}`} className="text-right">
          {formatPercentage(validator.commission)}
        </div>,
      ],
    };
  });

  return (
    <StyledTable
      id="my-validators"
      tableProps={{ className: "w-full" }}
      headers={head}
      rows={rows}
    />
  );
};
