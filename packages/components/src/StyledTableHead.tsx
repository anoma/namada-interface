import clsx from "clsx";
import { MouseEvent, ReactNode } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

export type SortableHeaderOptions = "desc" | "asc" | undefined;

export type TableHeader = {
  children: ReactNode;
  sortable?: boolean;
  sorting?: SortableHeaderOptions;
  onSort?: (sorting: SortableHeaderOptions) => void;
} & React.ComponentPropsWithoutRef<"th">;

type StyledTableHeadProps = {
  id: string;
  headers: (TableHeader | ReactNode)[];
  headProps?: React.ComponentPropsWithoutRef<"thead">;
};

const checkIsTableHeader = (
  tableHeaderEl: TableHeader | ReactNode
): tableHeaderEl is TableHeader =>
  tableHeaderEl !== undefined && !!(tableHeaderEl as TableHeader).children;

const renderTableHeaderElement = (
  id: string,
  h: TableHeader | ReactNode,
  index: number
): ReactNode => {
  const key = `table-th-${id}-${index}`;
  const baseClassName = `px-6 py-2 select-none`;

  if (checkIsTableHeader(h)) {
    const {
      className: additionalClassName,
      children,
      onClick,
      sortable,
      onSort,
      sorting,
      ...props
    } = h;

    const _onClick = (e: MouseEvent<HTMLTableCellElement>): void => {
      if (sortable && onSort) {
        onSort(
          sorting === undefined ? "desc"
          : sorting === "desc" ? "asc"
          : undefined
        );
      }
      if (onClick) onClick(e);
    };

    return (
      <th
        key={key}
        className={twMerge(
          clsx(baseClassName, additionalClassName, {
            "cursor-pointer": sortable,
          })
        )}
        onClick={_onClick}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className="w-full">{children}</span>
          {sortable && (
            <span
              className={clsx("pl-2", { "text-white": sorting !== undefined })}
            >
              {sorting === "desc" && <FaSortUp className="mt-[0.5em]" />}
              {sorting === "asc" && <FaSortDown className="mt-[-0.5em]" />}
              {sorting === undefined && <FaSort />}
            </span>
          )}
        </div>
      </th>
    );
  }

  return (
    <th key={key} className={baseClassName}>
      {h}
    </th>
  );
};

export const StyledTableHead = ({
  id,
  headProps = {},
  headers,
}: StyledTableHeadProps): JSX.Element => {
  const { className: headClassName, ...otherHeadProps } = headProps;
  return (
    <thead
      className={twMerge(
        "text-sm text-neutral-400 font-medium text-left",
        headClassName
      )}
      {...otherHeadProps}
    >
      <tr>
        {headers.map((h, index) => renderTableHeaderElement(id, h, index))}
      </tr>
    </thead>
  );
};
