import { ActionButton, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { Search } from "App/Common/Search";
import { TableRowLoading } from "App/Common/TableRowLoading";
import { WalletAddress } from "App/Common/WalletAddress";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import { atomsAreLoading, atomsAreNotInitialized } from "atoms/utils";
import { allValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import { useValidatorFilter } from "hooks/useValidatorFilter";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SortedColumnPair, Validator } from "types";
import { createSortableHeaderOption, sortCollection } from "utils/sorting";
import { ValidatorAlias } from "./ValidatorAlias";
import { ValidatorThumb } from "./ValidatorThumb";
import { ValidatorsTable } from "./ValidatorsTable";
import StakingRoutes from "./routes";

type AllValidatorsProps = {
  resultsPerPage?: number;
  initialPage?: number;
};

type SortableColumns = "votingPowerInNAM" | "expectedApr";

export const AllValidatorsTable = ({
  resultsPerPage = 100,
  initialPage = 0,
}: AllValidatorsProps): JSX.Element => {
  const validators = useAtomValue(allValidatorsAtom);
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [sorting, setSorting] = useState<SortedColumnPair<SortableColumns>>();

  const filteredValidators = useValidatorFilter({
    validators: validators.isSuccess ? validators.data : [],
    myValidatorsAddresses: [],
    searchTerm: filter,
    onlyMyValidators: false,
  });

  const sortedAndFilteredValidators = useMemo(() => {
    if (!sorting) return filteredValidators;
    return sortCollection<Validator, SortableColumns>(
      filteredValidators,
      sorting
    );
  }, [filteredValidators, sorting]);

  const headers = [
    "",
    "Validator",
    "Address",
    createSortableHeaderOption<Validator, SortableColumns>(
      <div key={`all-validators-voting-power`} className="text-right w-full">
        Voting Power
      </div>,
      "votingPowerInNAM",
      setSorting,
      sorting
    ),
    createSortableHeaderOption<Validator, SortableColumns>(
      <div key={`all-validators-comission`} className="text-right w-full">
        Commission
      </div>,
      "expectedApr",
      setSorting,
      sorting
    ),
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
          <NamCurrency
            amount={validator.votingPowerInNAM}
            forceBalanceDisplay
          />
        )}
        <span className="text-neutral-600 text-sm">
          {formatPercentage(BigNumber(validator.votingPowerPercentage || 0))}
        </span>
      </div>,
      // Commission:
      <div key={`comission-${validator.address}`} className="text-right">
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
            onChange={(value: string) => setFilter(value)}
            placeholder="Search Validator"
          />
          {isConnected && (
            <ActionButton
              size="sm"
              backgroundColor="cyan"
              borderRadius="sm"
              onClick={() => navigate(StakingRoutes.incrementBonding().url)}
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
