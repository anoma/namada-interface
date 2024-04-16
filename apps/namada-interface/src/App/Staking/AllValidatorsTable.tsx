import { StyledTable } from "@namada/components";
import { formatPercentage, shortenAddress } from "@namada/utils";
import FormattedPaginator from "App/Common/FormattedPaginator";
import { ValidatorSearch, filterValidators } from "App/Staking/ValidatorSearch";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { GoGlobe } from "react-icons/go";
import { fetchAllValidatorsAtom } from "slices/validators";
import { useLoadable } from "store/hooks";

type AllValidatorsProps = {
  resultsPerPage?: number;
  initialPage?: number;
};

export const AllValidatorsTable = ({
  resultsPerPage = 20,
  initialPage = 0,
}: AllValidatorsProps): JSX.Element => {
  const validators = useLoadable(fetchAllValidatorsAtom);
  const [page, setPage] = useState(initialPage);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setPage(0);
  }, [filter]);

  // TODO:
  if (validators.state === "loading") return <>Loading...</>;
  if (validators.state === "hasError") return <>Error!</>;

  const filteredValidators = validators.data.filter(filterValidators(filter));
  const paginatedValidators = filteredValidators.slice(
    page * resultsPerPage,
    page * resultsPerPage + resultsPerPage
  );

  const pageCount = Math.ceil(filteredValidators.length / resultsPerPage);
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

  const rows = paginatedValidators.map((validator) => ({
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
  }));

  return (
    <>
      <div className="max-w-[200px]">
        <ValidatorSearch onChange={(value: string) => setFilter(value)} />
      </div>
      <StyledTable
        tableProps={{ className: "w-full" }}
        id="all-validators"
        headers={headers}
        rows={rows}
      />
      <div className="mt-8 mb-4">
        <FormattedPaginator
          pageRangeDisplayed={3}
          pageCount={pageCount}
          onPageChange={({ selected }) => {
            setPage(selected);
          }}
        />
      </div>
    </>
  );
};
