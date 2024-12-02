import { getDefaultStore } from "jotai";
import { TransferTransactionData } from "types";
import { transactionHistoryAtom } from "./atoms";

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
