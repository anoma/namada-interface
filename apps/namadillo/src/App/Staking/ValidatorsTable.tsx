import { TableHeader, TableRow } from "@namada/components";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { GoInfo } from "react-icons/go";
import { twMerge } from "tailwind-merge";
import { Validator } from "types";
import { ValidatorInfoPanel } from "./ValidatorInfoPanel";

type ValidatorsTableProps = {
  id: string;
  headers: (TableHeader | React.ReactNode)[];
  validatorList: Validator[];
  renderRow: (validator: Validator) => TableRow;
  resultsPerPage?: number;
  initialPage?: number;
  tableClassName?: string;
  updatedAmountByAddress?: Record<string, BigNumber | undefined>;
};

export const ValidatorsTable = ({
  id,
  headers,
  renderRow,
  validatorList,
  resultsPerPage = 10,
  initialPage = 0,
  tableClassName,
}: ValidatorsTableProps): JSX.Element => {
  const [page, setPage] = useState(initialPage);

  const [selectedValidator, setSelectedValidator] = useState<
    Validator | undefined
  >();

  useEffect(() => {
    const onCloseInfo = (): void => setSelectedValidator(undefined);
    document.documentElement.addEventListener("click", onCloseInfo);
    return () => {
      document.documentElement.removeEventListener("click", onCloseInfo);
    };
  }, []);

  const mapValidatorRow = useCallback(
    (validator: Validator): TableRow => {
      const row = renderRow(validator);
      row.cells.push(
        <i
          onClick={(e) => {
            e.stopPropagation();
            setSelectedValidator(validator);
          }}
          className={clsx(
            "cursor-pointer flex justify-end relative",
            "hover:text-cyan active:top-px"
          )}
        >
          <GoInfo />
        </i>
      );
      return row;
    },
    [renderRow, setSelectedValidator]
  );

  useEffect(() => {
    setPage(0);
  }, [validatorList]);

  const paginatedItems = validatorList.slice(
    page * resultsPerPage,
    page * resultsPerPage + resultsPerPage
  );

  const pageCount = Math.ceil(validatorList.length / resultsPerPage);

  return (
    <TableWithPaginator
      id={id}
      headers={headers.concat("")}
      renderRow={mapValidatorRow}
      itemList={paginatedItems}
      page={page}
      pageCount={pageCount}
      onPageChange={setPage}
      tableProps={{
        className: twMerge(
          "w-full flex-1 [&_td]:px-1 [&_th]:px-1 [&_td:first-child]:pl-4 [&_td]:h-[64px]",
          "[&_td]:font-normal [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4",
          "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md",
          tableClassName
        ),
      }}
      headProps={{ className: "text-neutral-500" }}
    >
      {selectedValidator && (
        <ValidatorInfoPanel
          className="h-full right-0 top-0"
          validator={selectedValidator}
          onClose={() => setSelectedValidator(undefined)}
        />
      )}
    </TableWithPaginator>
  );
};
