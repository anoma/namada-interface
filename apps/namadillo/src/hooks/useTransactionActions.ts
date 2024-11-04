import { transactionHistoryAtom } from "atoms/transactions/atoms";
import { useAtom } from "jotai";
import { TransferTransactionData } from "types";

type UseTransactionActionsOutput = {
  transactions: TransferTransactionData[];
  addTransaction: (tx: TransferTransactionData) => void;
  updateTransaction: (
    hash: string,
    updatedTx: Partial<TransferTransactionData>
  ) => void;
};

export const useTransactionActions = (): UseTransactionActionsOutput => {
  const [transactions, setTransactions] = useAtom(transactionHistoryAtom);

  const addTransaction = (tx: TransferTransactionData): void => {
    setTransactions((txs: TransferTransactionData[]) => txs.concat(tx));
  };

  const updateTransaction = (
    hash: string,
    updatedTx: Partial<TransferTransactionData>
  ): void => {
    setTransactions((txs: TransferTransactionData[]) =>
      txs.map((tx) => (tx.hash === hash ? { ...tx, ...updatedTx } : tx))
    );
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
  };
};
