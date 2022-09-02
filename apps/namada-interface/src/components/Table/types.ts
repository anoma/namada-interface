export type ColumnDefinition = {
  uuid: string;
  columnLabel: string;
  width: string;
};

export type TableConfigurations<RowType> = {
  title: string;
  rowRenderer: (rowData: RowType) => JSX.Element;
  columns: ColumnDefinition[];
};

export type RowBase = {
  uuid: string;
};
