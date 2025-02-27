import clsx from "clsx";
import { ReactNode, useMemo } from "react";
import { twMerge } from "tailwind-merge";

type StyledTableRowProps = {
  id: string;
  index: number;
  row: TableRow;
};

export type TableRow = {
  cells: (ReactNode | CustomTableCell)[];
  key?: React.Key;
} & React.ComponentPropsWithoutRef<"tr">;

export type CustomTableCell = {
  render: () => ReactNode;
};

const checkIsCustomTableCell = (
  tableCellEl: CustomTableCell | ReactNode
): tableCellEl is CustomTableCell =>
  tableCellEl !== undefined &&
  tableCellEl !== null &&
  !!(tableCellEl as CustomTableCell).render;

export const StyledTableRow = ({
  id,
  row,
  index,
}: StyledTableRowProps): JSX.Element => {
  const { cells, className: rowsClassName, key: _key, ...props } = row;
  const tableRows = useMemo(
    () => (
      <tr
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
            className="min-h-[78px] px-6 align-middle"
            key={`table-td-${id}-${index}-${cellId}`}
          >
            {checkIsCustomTableCell(cell) ? cell.render() : cell}
          </td>
        ))}
      </tr>
    ),
    [row]
  );

  return tableRows;
};
