import {
  SkeletonLoading,
  StyledTable,
  TableHeader,
  TableRow,
} from "@namada/components";
import { FormattedPaginator } from "App/Common/FormattedPaginator";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TableWithPaginatorProps<T> = {
  id: string;
  headers: (TableHeader | React.ReactNode)[];
  renderRow: (item: T, index: number) => TableRow;
  itemList: T[];
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  children?: React.ReactNode;
  isLoading?: boolean;
} & Pick<React.ComponentProps<typeof StyledTable>, "tableProps" | "headProps">;

export const TableWithPaginator = <T,>({
  id,
  headers,
  renderRow,
  itemList,
  page = 0,
  pageCount = 1,
  onPageChange,
  children,
  tableProps,
  headProps,
  isLoading = false,
}: TableWithPaginatorProps<T>): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<TableRow[]>([]);

  // Update all rows
  useEffect(() => {
    setRows(itemList.map(renderRow));
  }, [renderRow, itemList]);

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
        forcePage={page}
        onPageChange={({ selected }) => {
          scrollTop();
          onPageChange?.(selected);
        }}
      />
    );
  }, [page, itemList, onPageChange]);

  // Show loading skeleton when data is loading and if no rows are rendered
  if (isLoading && rows.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <SkeletonLoading height="450px" width="100%" />
        <div className="flex justify-center">
          <SkeletonLoading height="40px" width="100px" />
        </div>
      </div>
    );
  }

  // Show empty state only when no results
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
        "grid grid-rows-[1fr_auto] flex-1 overflow-hidden w-full gap-2"
      )}
    >
      {styledTable}
      {pagination}
      {children}
    </div>
  );
};
