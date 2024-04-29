import { StyledTable, TableHeader, TableRow } from "@namada/components";
import { FormattedPaginator } from "App/Common/FormattedPaginator";
import { useEffect, useState } from "react";
import { Validator } from "slices/validators";
import { twMerge } from "tailwind-merge";

type ValidatorsTableProps = {
  id: string;
  headers: (TableHeader | React.ReactNode)[];
  validatorList: Validator[];
  renderRow: (validator: Validator) => TableRow;
  resultsPerPage?: number;
  initialPage?: number;
  tableClassName?: string;
};

const ValidatorsTable = ({
  id,
  headers,
  renderRow,
  validatorList,
  resultsPerPage = 20,
  initialPage = 0,
  tableClassName,
}: ValidatorsTableProps): JSX.Element => {
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setPage(0);
  }, [validatorList]);

  const paginatedValidators = validatorList.slice(
    page * resultsPerPage,
    page * resultsPerPage + resultsPerPage
  );
  const pageCount = Math.ceil(validatorList.length / resultsPerPage);

  return (
    <>
      <StyledTable
        id={id}
        headers={headers}
        rows={paginatedValidators.map(renderRow)}
        tableProps={{
          className: twMerge(
            "w-full [&_td]:px-1 [&_th]:px-1 [&_td:first-child]:pl-4 [&_td]:h-[64px]",
            "[&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4",
            "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md",
            tableClassName
          ),
        }}
        headProps={{ className: "text-neutral-500" }}
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
