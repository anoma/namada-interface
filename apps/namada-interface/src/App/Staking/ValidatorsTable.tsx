import { StyledTable, TableHeader, TableRow } from "@namada/components";
import { FormattedPaginator } from "App/Common/FormattedPaginator";
import { useEffect, useState } from "react";
import { Validator } from "slices/validators";
import { twMerge } from "tailwind-merge";

type ValidatorsTableProps = {
  id: string;
  headers: (TableHeader | React.ReactNode)[];
  filter: string;
  validatorList: Validator[];
  renderRows: (validator: Validator) => TableRow;
  resultsPerPage?: number;
  initialPage?: number;
  tableClassName?: string;
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

const ValidatorsTable = ({
  id,
  headers,
  filter,
  renderRows,
  validatorList,
  resultsPerPage = 20,
  initialPage = 0,
  tableClassName,
}: ValidatorsTableProps): JSX.Element => {
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setPage(0);
  }, [filter]);

  const filteredValidators = validatorList.filter(filterValidators(filter));

  const paginatedValidators = filteredValidators.slice(
    page * resultsPerPage,
    page * resultsPerPage + resultsPerPage
  );

  const pageCount = Math.ceil(filteredValidators.length / resultsPerPage);

  return (
    <>
      <StyledTable
        id={id}
        headers={headers}
        rows={paginatedValidators.map(renderRows)}
        tableProps={{
          className: twMerge(
            "w-full [&_td]:px-2 [&_th]:px-2 [&_td:first-child]:pl-4",
            "[&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4",
            "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md",
            tableClassName
          ),
        }}
        headProps={{ className: "text-white" }}
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

export default ValidatorsTable;
