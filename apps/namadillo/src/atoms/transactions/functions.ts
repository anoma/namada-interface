import { TransferTransactionData } from "types";

export const filterPendingTransactions = (
  tx: TransferTransactionData
): boolean => tx.status === "pending" || tx.status === "idle";

export const filterCompleteTransactions = (
  tx: TransferTransactionData
): boolean => tx.status === "success" || tx.status === "error";
