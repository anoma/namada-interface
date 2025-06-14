import { ActionButton, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { Search } from "App/Common/Search";
import { TableRowLoading } from "App/Common/TableRowLoading";
import { WalletAddress } from "App/Common/WalletAddress";
import { routes } from "App/routes";
import { atomsAreLoading, atomsAreNotInitialized } from "atoms/utils";
import { allValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { useValidatorFilter } from "hooks/useValidatorFilter";
import { useValidatorTableSorting } from "hooks/useValidatorTableSorting";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { Validator } from "types";
import { ValidatorAlias } from "./ValidatorAlias";
import { ValidatorThumb } from "./ValidatorThumb";
import { ValidatorsTable } from "./ValidatorsTable";

type AllValidatorsProps = {
  resultsPerPage?: number;
  initialPage?: number;
};

export const AllValidatorsTable = ({
  resultsPerPage = 10,
  initialPage = 0,
}: AllValidatorsProps): JSX.Element => {
  const validators = useAtomValue(allValidatorsAtom);
  const [searchTerm, setSearchTerm] = useState("");
  const userHasAccount = useUserHasAccount();

  const filteredValidators = useValidatorFilter({
    validators: validators.isSuccess ? validators.data : [],
    myValidatorsAddresses: [],
    searchTerm,
    onlyMyValidators: false,
  });

  const { sortedValidators: sortedAndFilteredValidators, sortableColumns } =
    useValidatorTableSorting({
      validators: filteredValidators,
      stakedAmountByAddress: {},
    });

  const headers = [
    "",
    "Validator",
    "Address",
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

  const renderRow = (validator: Validator): TableRow => ({
    className: "[&_td:first-child]:pr-0",
    cells: [
      // Thumbnail:
      <ValidatorThumb
        key={`validator-image-${validator.address}`}
        imageUrl={validator.imageUrl}
        alt={validator.alias ?? validator.address}
      />,
      // Alias:
      <ValidatorAlias
        key={`validator-alias-${validator.address}`}
        alias={validator.alias}
      />,
      // Address:
      <WalletAddress
        key={`address-${validator.address}`}
        address={validator.address}
      />,
      // Voting Power:
      <div
        className="flex flex-col text-right"
        key={`validator-voting-power-${validator.address}`}
      >
        {validator.votingPowerInNAM && (
          <NamCurrency amount={validator.votingPowerInNAM} decimalPlaces={2} />
        )}
        <span className="text-neutral-600 text-sm">
          {formatPercentage(BigNumber(validator.votingPowerPercentage || 0))}
        </span>
      </div>,
      // Commission:
      <div key={`commission-${validator.address}`} className="text-right">
        {formatPercentage(BigNumber(validator.commission))}
      </div>,
    ],
  });

  if (atomsAreLoading(validators) || atomsAreNotInitialized(validators)) {
    return <TableRowLoading count={2} />;
  }

  return (
    <AtomErrorBoundary
      result={validators}
      niceError="Unable to load validators list"
      containerProps={{ className: "pb-16" }}
    >
      <div className="min-h-[450px] flex flex-col">
        <div className="grid grid-cols-[40%_max-content] justify-between mb-5">
          <Search
            onChange={(value: string) => setSearchTerm(value)}
            placeholder="Search Validator"
          />
          {userHasAccount && (
            <ActionButton
              size="sm"
              outlineColor="cyan"
              backgroundColor="cyan"
              backgroundHoverColor="transparent"
              textColor="black"
              textHoverColor="cyan"
              href={routes.stakingBondingIncrement}
            >
              Stake
            </ActionButton>
          )}
        </div>
        {validators.data && (
          <div className="flex flex-col h-[490px] overflow-hidden">
            <ValidatorsTable
              id="all-validators"
              validatorList={sortedAndFilteredValidators}
              headers={headers}
              initialPage={initialPage}
              resultsPerPage={resultsPerPage}
              renderRow={renderRow}
            />
          </div>
        )}
      </div>
    </AtomErrorBoundary>
  );
};
