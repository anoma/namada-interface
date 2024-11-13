import { Panel } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { useTransactionActions } from "hooks/useTransactionActions";
import { TransactionNotFoundPanel } from "./TransactionNotFoundPanel";
import { TransferTransactionTimeline } from "./TransferTransactionTimeline";

export const TransactionDetails = (): JSX.Element => {
  const { hash } = useSanitizedParams();
  const { findByHash } = useTransactionActions();

  const transaction = findByHash(hash || "");
  if (!transaction) {
    return <TransactionNotFoundPanel hash={hash || ""} />;
  }

  return (
    <Panel className="flex-1 h-full">
      <h1 className="mb-12">Transactions</h1>
      <TransferTransactionTimeline transaction={transaction} />
    </Panel>
  );
};
