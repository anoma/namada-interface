import { ActionButton, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { WalletAddress } from "App/Common/WalletAddress";
import { routes } from "App/routes";
import { myValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import { useValidatorTableSorting } from "hooks/useValidatorTableSorting";
import { useAtomValue } from "jotai";
import { Address, MyValidator, Validator } from "types";
import { ValidatorCard } from "./ValidatorCard";
import { ValidatorsTable } from "./ValidatorsTable";

export const MyValidatorsTable = (): JSX.Element => {
  const myValidators = useAtomValue(myValidatorsAtom);

  const validators =
    myValidators.isSuccess ?
      myValidators.data
        .filter((v) => v.stakedAmount?.gt(0))
        .map((v: MyValidator) => v.validator)
    : [];

  const stakedAmountByAddress: Record<Address, BigNumber> =
    myValidators.isSuccess ?
      myValidators.data.reduce((prev, current) => {
        return {
          ...prev,
          [current.validator.address]: current.stakedAmount,
        };
      }, {})
    : {};

  const { sortableColumns, sortedValidators } = useValidatorTableSorting({
    validators,
    stakedAmountByAddress,
  });

  const head = [
    "My Validators",
    "Address",
    {
      children: "Staked Amount",
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
    return {
      className: "",
      cells: [
        <ValidatorCard
          key={`my-validator-${validator.address}`}
          validator={validator}
          showAddress={false}
        />,
        <WalletAddress
          key={`address-${validator.address}`}
          address={validator.address}
        />,
        <div
          key={`my-validator-currency-${validator.address}`}
          className="text-right leading-tight"
        >
          <NamCurrency
            amount={
              stakedAmountByAddress[validator.address] || new BigNumber(0)
            }
            decimalPlaces={2}
          />
        </div>,
        <div
          className="flex flex-col text-right leading-tight"
          key={`my-validator-voting-power-${validator.address}`}
        >
          {validator.votingPowerInNAM && (
            <NamCurrency
              amount={validator.votingPowerInNAM}
              decimalPlaces={2}
            />
          )}
          <span className="text-neutral-600 text-sm">
            {formatPercentage(BigNumber(validator.votingPowerPercentage || 0))}
          </span>
        </div>,
        <div
          key={`commission-${validator.address}`}
          className="text-right leading-tight"
        >
          {formatPercentage(validator.commission)}
        </div>,
      ],
    };
  };

  return (
    <>
      <nav className="flex justify-end -mt-15 gap-2">
        <ActionButton
          className="basis-[content] py-1"
          backgroundColor="cyan"
          size="md"
          href={routes.stakingBondingIncrement}
        >
          Stake
        </ActionButton>
        <ActionButton
          className="basis-[content] py-1"
          backgroundColor="white"
          size="md"
          href={routes.stakingBondingRedelegate}
        >
          Redelegate
        </ActionButton>
        <ActionButton
          className="basis-[content] py-1 hover:before:border-pink"
          backgroundColor="transparent"
          outlineColor="white"
          textColor="white"
          textHoverColor="white"
          backgroundHoverColor="pink"
          size="md"
          href={routes.stakingBondingUnstake}
        >
          Unstake
        </ActionButton>
      </nav>
      <AtomErrorBoundary
        result={myValidators}
        niceError="Unable to load your validators list"
        containerProps={{ className: "pb-16" }}
      >
        <ValidatorsTable
          id="my-validators"
          tableClassName="mt-2"
          validatorList={sortedValidators}
          headers={head}
          renderRow={renderRow}
        />
      </AtomErrorBoundary>
    </>
  );
};
