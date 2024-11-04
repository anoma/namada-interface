import { Panel } from "@namada/components";
import { transactionHistoryAtom } from "atoms/transactions/atoms";
import { useAtomValue } from "jotai";
import { TransferTransactionData } from "types";
import { TransactionCard } from "./TransactionCard";

export const TransactionHistory = (): JSX.Element => {
  const transactions = useAtomValue(transactionHistoryAtom);
  const pending = transactions.filter(
    (t) => t.status === "pending" || t.status === "idle"
  );
  const complete = transactions.filter(
    (t) => t.status === "success" || t.status === "error"
  );
  const noTransactionsFound = pending.length + complete.length === 0;

  const renderList = (
    transactions: TransferTransactionData[]
  ): React.ReactNode => {
    return (
      <ul>
        {transactions.map((tx) => (
          <li key={tx.hash}>
            <TransactionCard transaction={tx} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Panel className="flex-1 h-full">
      <h2 className="mb-4">Transfers</h2>
      {pending.length > 0 && (
        <section>
          <h2>In Progress</h2>
          {renderList(pending)}
        </section>
      )}
      {pending.length > 0 && (
        <section>
          <h2>History</h2>
          {renderList(complete)}
        </section>
      )}
      {noTransactionsFound && (
        <p className="font-light">
          No transaction has been stored on this device.
        </p>
      )}
    </Panel>
  );
};
