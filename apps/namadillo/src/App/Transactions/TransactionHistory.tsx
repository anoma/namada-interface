import { Panel } from "@namada/components";
import { myTransactionHistoryAtom } from "atoms/transactions/atoms";
import {
  filterCompleteTransactions,
  filterPendingTransactions,
} from "atoms/transactions/functions";
import { useAtomValue } from "jotai";
import { TransferTransactionData } from "types";
import { TransactionCard } from "./TransactionCard";

export const TransactionHistory = (): JSX.Element => {
  const transactions = useAtomValue(myTransactionHistoryAtom);
  const pending = transactions.filter(filterPendingTransactions);
  const complete = transactions.filter(filterCompleteTransactions);
  const noTransactionsFound = transactions.length === 0;

  const renderList = (
    transactions: TransferTransactionData[]
  ): React.ReactNode => {
    return (
      <ul className="flex flex-col gap-2">
        {transactions.map((tx) => (
          <li key={tx.hash}>
            <TransactionCard transaction={tx} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Panel className="flex flex-col gap-6 flex-1 h-full">
      <h2 className="mb-7">Transfers made by this device</h2>
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm mb-3">In Progress</h2>
          {renderList(pending.toReversed())}
        </section>
      )}
      {complete.length > 0 && (
        <section>
          <h2 className="text-sm mb-3">History</h2>
          {renderList(complete.toReversed())}
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
