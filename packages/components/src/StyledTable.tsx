import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type TableRow = {
  cells: React.ReactNode[];
} & React.ComponentPropsWithoutRef<"tr">;

type StyledTableProps = {
  id: string;
  sortable?: boolean;
  containerClassName?: string;
  tableProps?: React.ComponentPropsWithoutRef<"table">;
  headProps?: React.ComponentPropsWithoutRef<"thead">;
  headClassName?: string;
  className?: string;
  headers?: React.ReactNode[];
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
  const { className: headClassName, ...otherHeadProps } = headProps;

  return (
    <div className={twMerge("max-w-full overflow-x-auto", containerClassName)}>
      <table
        style={{ minWidth: (headClassName?.length || 0) * 100 + "px" }}
        className={twMerge("border-spacing-4", tableClassName)}
        {...otherTableProps}
      >
        <thead
          className={twMerge(
            "text-sm text-neutral-400 font-medium text-left",
            headClassName
          )}
          {...otherHeadProps}
        >
          <tr>
            {headers.map((h, index) => (
              <th key={`table-th-${id}-${index}`} className="px-6 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-white text-base font-medium">
          {rows.map((row, index) => {
            const { cells, className: rowsClassName, ...props } = row;
            return (
              <tr
                key={`table-tr-${index}`}
                className={twMerge(
                  clsx("group/row", {
                    "bg-neutral-900": index % 2 === 0,
                    "bg-black": index % 2,
                  }),
                  rowsClassName
                )}
                {...props}
              >
                {cells.map((cell, cellId) => (
                  <td
                    className="h-[78px] px-6 align-middle"
                    key={`table-td-${index}-${cellId}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
