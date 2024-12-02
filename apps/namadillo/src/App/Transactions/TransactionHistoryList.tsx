import { TransferTransactionData } from "types";
import { TransactionCard } from "./TransactionCard";

export const TransactionList = ({
  transactions,
}: {
  transactions: TransferTransactionData[];
}): JSX.Element => (
  <ul className="flex flex-col gap-2">
    {transactions.map((tx) => (
      <li key={tx.hash}>
        <TransactionCard transaction={tx} />
      </li>
    ))}
  </ul>
);
