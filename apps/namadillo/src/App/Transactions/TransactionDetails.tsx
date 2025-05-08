import { Panel } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { InnerTransaction } from "@namada/indexer-client";
import { TransactionReceipt } from "App/Common/TransactionReceipt";
import { indexerApiAtom } from "atoms/api";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { TransactionNotFoundPanel } from "./TransactionNotFoundPanel";

export const TransactionDetails = (): JSX.Element => {
  const { hash } = useSanitizedParams();
  const api = useAtomValue(indexerApiAtom);
  const [transaction, setTransaction] = useState<InnerTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionData = async (): Promise<void> => {
      try {
        if (hash) {
          const response = await api.apiV1ChainInnerTxIdGet(hash);
          setTransaction(response.data);
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [hash, api]);

  if (loading) {
    return (
      <Panel className="flex-1 h-full">
        <h1 className="mb-12">Transactions</h1>
        <div>Loading transaction details...</div>
      </Panel>
    );
  }

  if (!transaction) {
    return <TransactionNotFoundPanel hash={hash || ""} />;
  }

  return (
    <Panel className="flex-1 h-full">
      <h1 className="mb-12">Transactions</h1>
      <TransactionReceipt transaction={transaction} />
    </Panel>
  );
};
