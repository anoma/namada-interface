import { TableRow } from "@namada/components";
import { formatPercentage, shortenAddress } from "@namada/utils";
import { ValidatorSearch } from "App/Staking/ValidatorSearch";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { GoGlobe } from "react-icons/go";
import { Validator, fetchAllValidatorsAtom } from "slices/validators";
import { useLoadable } from "store/hooks";
import ValidatorsTable from "./ValidatorsTable";

type AllValidatorsProps = {
  resultsPerPage?: number;
  initialPage?: number;
};

export const AllValidatorsTable = ({
  resultsPerPage = 20,
  initialPage = 0,
}: AllValidatorsProps): JSX.Element => {
  const validators = useLoadable(fetchAllValidatorsAtom);
  const [filter, setFilter] = useState("");

  // TODO:
  if (validators.state === "loading") return <>Loading...</>;
  if (validators.state === "hasError") return <>Error!</>;

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
    "",
  ];

  const renderRows = (validator: Validator): TableRow => ({
    className: "[&_td:first-child]:pr-0",
    cells: [
      // Thumbnail:
      <img
        key={`validator-image-${validator.uuid}`}
        src={validator.imageUrl}
        className="rounded-full aspect-square max-w-12"
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
      // Url:
      <a
        key={`icon-globe-${validator.uuid}`}
        href={validator.homepageUrl}
        target="_blank"
        className="hover:text-yellow"
        rel="nofollow noreferrer"
      >
        <GoGlobe />
      </a>,
    ],
  });

  return (
    <>
      <div className="max-w-[200px]">
        <ValidatorSearch onChange={(value: string) => setFilter(value)} />
      </div>
      <ValidatorsTable
        id="all-validators"
        validatorList={validators.data}
        headers={headers}
        initialPage={initialPage}
        resultsPerPage={resultsPerPage}
        filter={filter}
        renderRows={renderRows}
      />
    </>
  );
};
