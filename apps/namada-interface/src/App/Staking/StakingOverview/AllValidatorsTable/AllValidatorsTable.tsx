import { StyledTable } from "@namada/components";
import { formatPercentage, shortenAddress } from "@namada/utils";
import FormattedPaginator from "App/Common/FormattedPaginator/FormattedPaginator";
import { ValidatorSearch } from "App/Staking/ValidatorSearch/ValidatorSearch";
import BigNumber from "bignumber.js";
import { useAtomValue, useSetAtom } from "jotai";
import debounce from "lodash.debounce";
import { useEffect, useRef, useState } from "react";
import { GoGlobe } from "react-icons/go";
import {
  Validator,
  fetchAllValidatorsAtom,
  validatorsAtom,
} from "slices/validators";

type AllValidatorsProps = {
  resultsPerPage?: number;
  initialPage?: number;
};

const filterValidators =
  (search: string) =>
  (validator: Validator): boolean => {
    const preparedSearch = search.toLowerCase().trim();
    return (
      validator.address.toLowerCase().indexOf(preparedSearch) > -1 ||
      validator.alias.toLowerCase().indexOf(preparedSearch) > -1
    );
  };

export const AllValidatorsTable = ({
  resultsPerPage = 20,
  initialPage = 0,
}: AllValidatorsProps): JSX.Element => {
  const fetchValidators = useSetAtom(fetchAllValidatorsAtom);
  const validators = useAtomValue(validatorsAtom);
  const [page, setPage] = useState(initialPage);
  const [filter, setFilter] = useState("");
  const debouncedSearch = useRef(
    debounce((value: string) => setFilter(value), 300)
  );

  useEffect(() => {
    fetchValidators();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [filter]);

  if (validators.length === 0) return <></>;

  const filteredValidators = validators.filter(filterValidators(filter));
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
      <ValidatorSearch
        onChange={(value: string) => debouncedSearch.current(value)}
      />
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
