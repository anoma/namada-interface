import { Panel } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { myTransactionHistoryAtom } from "atoms/transactions";
import { useAtomValue } from "jotai";
import { TransactionNotFoundPanel } from "./TransactionNotFoundPanel";
import { TransactionTransferTimeline } from "./TransactionTransferTimeline";

export const TransactionDetails = (): JSX.Element => {
  const { hash } = useSanitizedParams();
  const transactionList = useAtomValue(myTransactionHistoryAtom);
  const transaction = transactionList.find((tx) => tx.hash === hash);

  if (!transaction) {
    return <TransactionNotFoundPanel hash={hash || ""} />;
  }

  return (
    <Panel className="flex-1 h-full">
      <h1 className="mb-6">Transactions</h1>
      <TransactionTransferTimeline transaction={transaction} />
    </Panel>
  );
};
