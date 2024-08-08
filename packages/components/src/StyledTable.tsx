import { ReactNode, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { StyledTableHead, TableHeader } from "./StyledTableHead";
import { StyledTableRow, TableRow } from "./StyledTableRow";

export type StyledTableProps = {
  id: string;
  containerClassName?: string;
  tableProps?: React.ComponentPropsWithoutRef<"table">;
  headProps?: React.ComponentPropsWithoutRef<"thead">;
  headClassName?: string;
  className?: string;
  headers?: (TableHeader | ReactNode)[];
  rows?: TableRow[];
};

export const StyledTable = ({
  id,
  containerClassName,
  tableProps = {},
  headProps = {},
  headers = [],
  rows = [],
}: StyledTableProps): JSX.Element => {
  const { className: tableClassName, ...otherTableProps } = tableProps;

  const tableHeaders = useMemo(
    () =>
      headers && (
        <StyledTableHead id={id} headers={headers} headProps={headProps} />
      ),
    [headers]
  );

  return (
    <div
      className={twMerge(
        "overscroll-contain max-w-full overflow-x-auto",
        containerClassName
      )}
    >
      <table
        style={{ minWidth: (headers?.length || 0) * 100 + "px" }}
        className={twMerge("border-spacing-4", tableClassName)}
        {...otherTableProps}
      >
        {tableHeaders}
        <tbody className="text-white text-base font-medium">
          {rows.map((row, index) => (
            <StyledTableRow
              key={row.key ?? `table-tr-${id}-${index}`}
              id={id}
              index={index}
              row={row}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
