import { Panel } from "@namada/components";
import { shortenAddress } from "@namada/utils";

type TransactionNotFoundPanelProps = {
  hash: string;
};

export const TransactionNotFoundPanel = ({
  hash,
}: TransactionNotFoundPanelProps): JSX.Element => {
  return (
    <Panel>
      <h1 className="mb-6">Transactions</h1>
      <p className="text-neutral-300 text-sm">
        The details of transaction{" "}
        <span className="text-white">{shortenAddress(hash || "", 10, 6)}</span>{" "}
        couldn&apos;t be found on this device.
      </p>
    </Panel>
  );
};
