import { StyledTable, TableHeader, TableRow } from "@namada/components";
import { FormattedPaginator } from "App/Common/FormattedPaginator";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TableWithPaginatorProps<T> = {
  id: string;
  headers: (TableHeader | React.ReactNode)[];
  itemList: T[];
  renderRow: (item: T, index: number) => TableRow;
  resultsPerPage?: number;
  initialPage?: number;
  children?: React.ReactNode;
} & Pick<React.ComponentProps<typeof StyledTable>, "tableProps" | "headProps">;

export const TableWithPaginator = <T,>({
  id,
  headers,
  renderRow,
  itemList,
  resultsPerPage = 100,
  initialPage = 0,
  tableProps,
  headProps,
  children,
}: TableWithPaginatorProps<T>): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(initialPage);
  const [rows, setRows] = useState<TableRow[]>([]);

  const paginatedItems = itemList.slice(
    page * resultsPerPage,
    page * resultsPerPage + resultsPerPage
  );

  const pageCount = Math.ceil(itemList.length / resultsPerPage);

  useEffect(() => {
    setPage(0);
  }, [itemList]);

  // Update all rows
  useEffect(() => {
    setRows(paginatedItems.map(renderRow));
  }, [renderRow, page, itemList]);

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
        headers={headers}
        rows={rows}
        containerClassName="table-container flex-1 dark-scrollbar overscroll-contain"
        tableProps={tableProps}
        headProps={headProps}
      />
    );
  }, [rows, tableProps, headProps]);

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
  }, [page, itemList]);

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
      {children}
    </div>
  );
};
