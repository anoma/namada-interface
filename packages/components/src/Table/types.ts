export type ColumnDefinition = {
  uuid: string;
  columnLabel: string;
  width: string;
  onClick?: () => void;
};

export type TableConfigurations<RowType, Callbacks> = {
  rowRenderer: (rowData: RowType, callbacks?: Callbacks) => JSX.Element;
  columns: ColumnDefinition[];
  callbacks?: Callbacks;
};

export type RowBase = {
  uuid: string;
};

// generic data type for tables that only have 2 columns, key and value
export type KeyValueData = RowBase & { key: string; value: string };
