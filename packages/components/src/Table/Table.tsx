import { TableContainer, TableElement } from "./Table.components";
import { ColumnDefinition, RowBase, TableConfigurations } from "./types";

export type Props<RowType extends RowBase, Callbacks> = {
  title: string;
  data: RowType[];
  tableConfigurations: TableConfigurations<RowType, Callbacks>;
  className?: string;
  subheadingSlot?: JSX.Element;
};

const getRenderedHeaderRow = (
  columnDefinitions: ColumnDefinition[]
): JSX.Element => {
  let shouldHaveBottomBorder = false;
  const columns = columnDefinitions.map((columnDefinition) => {
    // if at least one column header has text we render the bottom border
    if (columnDefinition.columnLabel && columnDefinition.columnLabel !== "") {
      shouldHaveBottomBorder = true;
    }

    return (
      <th
        key={`header_${columnDefinition.uuid}`}
        style={{ textAlign: "left", width: `${columnDefinition.width}` }}
        onClick={columnDefinition.onClick}
      >
        {columnDefinition.columnLabel}
      </th>
    );
  });

  const headerRowStyle = shouldHaveBottomBorder
    ? { borderBottom: "solid 1px grey" }
    : {};
  const header = (
    <tr key={`header_row_key`} style={headerRowStyle}>
      {columns}
    </tr>
  );

  return header;
};

const getRenderedDataRows = <RowType extends RowBase, Callbacks>(
  rows: RowType[],
  rowRenderer: (row: RowType, callbacks?: Callbacks) => JSX.Element,
  callbacks?: Callbacks
): JSX.Element[] => {
  const renderedRows = rows.map((row) => {
    return <tr key={row.uuid}>{rowRenderer(row, callbacks)}</tr>;
  });
  return renderedRows;
};

export const Table = <RowType extends RowBase, Callbacks>(
  props: Props<RowType, Callbacks>
): JSX.Element => {
  const { data, tableConfigurations, title, className, subheadingSlot } = props;
  const { columns, rowRenderer, callbacks } =
    tableConfigurations && tableConfigurations;

  const renderedHeaderRow = getRenderedHeaderRow(columns);
  const renderedDataRows = getRenderedDataRows<RowType, Callbacks>(
    data,
    rowRenderer,
    callbacks
  );

  const renderedRows = [renderedHeaderRow, ...renderedDataRows];
  return (
    <TableContainer className={className}>
      <h3>{title}</h3>
      {subheadingSlot}
      <TableElement style={{ borderCollapse: "collapse" }}>
        <tbody>{renderedRows}</tbody>
      </TableElement>
    </TableContainer>
  );
};
