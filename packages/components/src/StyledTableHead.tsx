import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export type TableHeader = {
  children: ReactNode;
  sortable?: boolean;
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
  const baseClassName = `px-6 py-2`;

  if (checkIsTableHeader(h)) {
    const { className: additionalClassName, children, ...props } = h;
    return (
      <th
        key={key}
        className={twMerge(baseClassName, additionalClassName)}
        {...props}
      >
        {children}
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
