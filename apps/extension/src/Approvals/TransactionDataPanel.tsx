type TransactionDataPanelProps = {
  data: string;
};

export const TransactionDataPanel = ({
  data,
}: TransactionDataPanelProps): JSX.Element => {
  return (
    <div className="flex flex-col flex-1 bg-neutral-900 rounded-sm px-4 py-4 overflow-auto">
      <pre>{data}</pre>
    </div>
  );
};
