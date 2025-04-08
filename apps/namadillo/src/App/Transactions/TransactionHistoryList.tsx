import { TransactionHistory } from "@namada/indexer-client";
import { TransactionCard } from "./TransactionCard";
export const TransactionList = ({
  transactions,
}: {
  transactions: TransactionHistory[];
}): JSX.Element => (
  <ul className="flex flex-col gap-2">
    {transactions?.map(({ tx }) => {
      return (
        <li key={tx?.txId}>
          <TransactionCard transaction={tx} />
        </li>
      );
    })}
  </ul>
);
