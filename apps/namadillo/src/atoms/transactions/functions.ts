import { DefaultApi } from "@namada/indexer-client";
import { fetchBlockTimestampByHeight } from "atoms/chain/services";
import { getDefaultStore } from "jotai";
import { TransferTransactionData } from "types";
import { TransactionHistory, transactionHistoryAtom } from "./atoms";

export const filterPendingTransactions = (
  tx: TransferTransactionData
): boolean => tx.status === "pending" || tx.status === "idle";

export const filterCompleteTransactions = (
  tx: TransferTransactionData
): boolean => tx.status === "success" || tx.status === "error";

export const searchAllStoredTxByHash = (
  hash: string
): TransferTransactionData | undefined => {
  const store = getDefaultStore();
  const fullTxHistory = store.get(transactionHistoryAtom);
  const allTxs = Object.values(fullTxHistory).flat();
  return allTxs.find((tx) => tx.hash === hash);
};

export const addTimestamps = async (
  api: DefaultApi,
  txs: TransactionHistory[]
): Promise<TransactionHistory[]> =>
  Promise.all(
    txs.map(async (tx) => {
      if (tx.timestamp) return tx;
      try {
        const timestamp = await fetchBlockTimestampByHeight(
          api,
          // @ts-expect-error – indexer type lacks blockHeight; patch later
          tx.blockHeight
        );
        return { ...tx, timestamp };
      } catch (err) {
        console.error("Failed to fetch block timestamp:", err);
        return tx;
      }
    })
  );
