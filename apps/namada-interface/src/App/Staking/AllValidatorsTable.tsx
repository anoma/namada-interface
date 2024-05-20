import { ActionButton, TableRow } from "@namada/components";
import { formatPercentage, shortenAddress } from "@namada/utils";
import { Search } from "App/Common/Search";
import { TableRowLoading } from "App/Common/TableRowLoading";
import BigNumber from "bignumber.js";
import { useValidatorFilter } from "hooks/useValidatorFilter";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { Validator, allValidatorsAtom } from "slices/validators";
import ValidatorsTable from "./ValidatorsTable";
import StakingRoutes from "./routes";

type AllValidatorsProps = {
  resultsPerPage?: number;
  initialPage?: number;
};

export const AllValidatorsTable = ({
  resultsPerPage = 100,
  initialPage = 0,
}: AllValidatorsProps): JSX.Element => {
  const validators = useAtomValue(allValidatorsAtom);
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const filteredValidators = useValidatorFilter({
    validators: validators.isSuccess ? validators.data : [],
    myValidatorsAddresses: [],
    searchTerm: filter,
    onlyMyValidators: false,
  });

  if (validators.isError) return <>Error!</>;

  const headers = [
    "",
    "Validator",
    "Address",
    <div key={`all-validators-voting-power`} className="text-right">
      Voting Power
    </div>,
    <div key={`all-validators-comission`} className="text-right">
      Commission
    </div>,
  ];

  const renderRow = (validator: Validator): TableRow => ({
    className: "[&_td:first-child]:pr-0",
    cells: [
      // Thumbnail:
      <img
        key={`validator-image-${validator.address}`}
        src={validator.imageUrl}
        className="w-8 rounded-full aspect-square"
      />,
      // Alias:
      <strong
        key={`validator-alias-${validator.address}`}
        className="font-medium"
      >
        {validator.alias}
      </strong>,
      // Address:
      shortenAddress(validator.address, 8, 8),
      // Voting Power:
      <div
        className="flex flex-col text-right"
        key={`validator-voting-power-${validator.address}`}
      >
        {validator.votingPowerInNAM && (
          <span>{validator.votingPowerInNAM?.toString()} NAM</span>
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

  if (validators.isLoading) {
    return <TableRowLoading count={2} />;
  }

  return (
    <div className="min-h-[450px] flex flex-col">
      <div className="grid grid-cols-[40%_max-content] justify-between mb-5">
        <Search
          onChange={(value: string) => setFilter(value)}
          placeholder="Search Validator"
        />
        {isConnected && (
          <ActionButton
            size="sm"
            color="primary"
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
            validatorList={filteredValidators}
            headers={headers}
            initialPage={initialPage}
            resultsPerPage={resultsPerPage}
            renderRow={renderRow}
          />
        </div>
      )}
    </div>
  );
};
