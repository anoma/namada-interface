import { StyledTable, TableHeader, TableRow } from "@namada/components";
import { FormattedPaginator } from "App/Common/FormattedPaginator";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoInfo } from "react-icons/go";
import { Validator } from "slices/validators";
import { twMerge } from "tailwind-merge";
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

const ValidatorsTable = ({
  id,
  headers,
  renderRow,
  validatorList,
  resultsPerPage = 100,
  initialPage = 0,
  tableClassName,
  updatedAmountByAddress,
}: ValidatorsTableProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(initialPage);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [selectedValidator, setSelectedValidator] = useState<
    Validator | undefined
  >();

  const updatesTracker = useRef<typeof updatedAmountByAddress>(
    updatedAmountByAddress || {}
  );

  const paginatedValidators = validatorList.slice(
    page * resultsPerPage,
    page * resultsPerPage + resultsPerPage
  );

  const pageCount = Math.ceil(validatorList.length / resultsPerPage);

  useEffect(() => {
    setPage(0);
  }, [validatorList]);

  useEffect(() => {
    const onCloseInfo = (): void => setSelectedValidator(undefined);
    document.documentElement.addEventListener("click", onCloseInfo);
    return () => {
      document.documentElement.removeEventListener("click", onCloseInfo);
    };
  }, []);

  // Update all validators
  useEffect(() => {
    setRows(paginatedValidators.map(mapValidatorRow));
  }, [page, validatorList]);

  // Only updates the addresses contained in updatedAmountByAddress that have changed
  useEffect(() => {
    if (!updatedAmountByAddress) return;
    setRows((rows) => {
      const newRows = [...rows];
      paginatedValidators.forEach((validator, idx) => {
        const skipUpdate =
          (!updatesTracker.current![validator.address] &&
            !updatedAmountByAddress[validator.address]) ||
          updatesTracker.current![validator.address] ===
            updatedAmountByAddress[validator.address];

        if (skipUpdate) return;
        newRows[idx] = mapValidatorRow(validator);
      });
      updatesTracker.current = { ...updatedAmountByAddress };
      return newRows;
    });
  }, [updatedAmountByAddress]);

  const mapValidatorRow = (validator: Validator): TableRow => {
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
  };

  const scrollTop = useCallback((): void => {
    const container = containerRef.current!.querySelector(".table-container");
    if (container) {
      container.scrollTo({ top: 0, left: 0 });
    }
  }, []);

  const styledTable = useMemo(() => {
    return (
      <StyledTable
        id={id}
        headers={headers.concat("")}
        rows={rows}
        containerClassName="table-container flex-1 dark-scrollbar"
        tableProps={{
          className: twMerge(
            "w-full flex-1 [&_td]:px-1 [&_th]:px-1 [&_td:first-child]:pl-4 [&_td]:h-[64px]",
            "[&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4",
            "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md",
            tableClassName
          ),
        }}
        headProps={{ className: "text-neutral-500" }}
      />
    );
  }, [rows, tableClassName]);

  const pagination = useMemo(() => {
    return (
      <FormattedPaginator
        pageRangeDisplayed={3}
        pageCount={pageCount}
        onPageChange={({ selected }) => {
          setPage(selected);
          scrollTop();
        }}
      />
    );
  }, [page]);

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm py-4 text-neutral-200">
        No results were found
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        "grid grid-rows-[auto_max-content] flex-1 overflow-hidden w-full gap-2"
      )}
    >
      {styledTable}
      {pagination}
      {selectedValidator && (
        <ValidatorInfoPanel
          className="h-full right-0 top-0"
          validator={selectedValidator}
          onClose={() => setSelectedValidator(undefined)}
        />
      )}
    </div>
  );
};

export default ValidatorsTable;
