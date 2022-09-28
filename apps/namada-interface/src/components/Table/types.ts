export type ColumnDefinition = {
  uuid: string;
  columnLabel: string;
  width: string;
};

export type TableConfigurations<RowType, Callbacks> = {
  title: string;
  rowRenderer: (rowData: RowType, callbacks?: Callbacks) => JSX.Element;
  columns: ColumnDefinition[];
  callbacks?: Callbacks;
};

export type RowBase = {
  uuid: string;
};
