import { useState } from "react";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { TableContainer, TableElement } from "./Table.components";
import { TableConfigurations, RowBase, ColumnDefinition } from "./types";

type Props<RowType extends RowBase> = {
  title: string;
  data: RowType[];
  tableConfigurations: TableConfigurations<RowType>;
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

const getRenderedDataRows = <RowType extends RowBase>(
  rows: RowType[],
  rowRenderer: (row: RowType) => JSX.Element
): JSX.Element[] => {
  const renderedRows = rows.map((row) => {
    return <tr key={row.uuid}>{rowRenderer(row)}</tr>;
  });
  return renderedRows;
};

export const Table = <T extends RowBase>(props: Props<T>): JSX.Element => {
  const { data, tableConfigurations } = props;
  const { title, columns, rowRenderer } =
    tableConfigurations && tableConfigurations;

  const renderedHeaderRow = getRenderedHeaderRow(columns);
  const renderedDataRows = getRenderedDataRows(data, rowRenderer);

  const renderedRows = [renderedHeaderRow, ...renderedDataRows];
  return (
    <TableContainer>
      <h3>{title}</h3>
      <TableElement style={{ borderCollapse: "collapse" }}>
        <tbody>{renderedRows}</tbody>
      </TableElement>
    </TableContainer>
  );
};
