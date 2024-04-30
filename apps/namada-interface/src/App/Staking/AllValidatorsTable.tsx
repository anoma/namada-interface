import { TableRow } from "@namada/components";
import { formatPercentage, shortenAddress } from "@namada/utils";
import { TableRowLoading } from "App/Common/TableRowLoading";
import { ValidatorSearch } from "App/Staking/ValidatorSearch";
import BigNumber from "bignumber.js";
import useValidatorFilter from "hooks/useValidatorFilter";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { Validator, allValidatorsAtom } from "slices/validators";
import ValidatorsTable from "./ValidatorsTable";

type AllValidatorsProps = {
  resultsPerPage?: number;
  initialPage?: number;
};

export const AllValidatorsTable = ({
  resultsPerPage = 20,
  initialPage = 0,
}: AllValidatorsProps): JSX.Element => {
  const validators = useAtomValue(allValidatorsAtom);
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
      Comission
    </div>,
  ];

  const renderRow = (validator: Validator): TableRow => ({
    className: "[&_td:first-child]:pr-0",
    cells: [
      // Thumbnail:
      <img
        key={`validator-image-${validator.uuid}`}
        src={validator.imageUrl}
        className="rounded-full aspect-square max-w-8"
      />,
      // Alias:
      validator.alias,
      // Address:
      shortenAddress(validator.address, 8, 8),
      // Voting Power:
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
      // Comission:
      <div key={`comission-${validator.uuid}`} className="text-right">
        {formatPercentage(BigNumber(validator.commission))}
      </div>,
    ],
  });

  if (validators.isLoading) {
    return <TableRowLoading count={2} />;
  }

  return (
    <div className="min-h-[450px] flex flex-col">
      <div className="max-w-[50%] mb-3">
        <ValidatorSearch onChange={(value: string) => setFilter(value)} />
      </div>
      {validators.data && (
        <ValidatorsTable
          id="all-validators"
          validatorList={filteredValidators}
          headers={headers}
          initialPage={initialPage}
          resultsPerPage={resultsPerPage}
          renderRow={renderRow}
        />
      )}
    </div>
  );
};
