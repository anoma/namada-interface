import { useQuery } from "@tanstack/react-query";
import { updateIbcTransactionStatus } from "atoms/integrations";
import { myTransactionHistoryAtom } from "atoms/transactions/atoms";
import { filterPendingTransactions } from "atoms/transactions/functions";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { IbcTransferTransactionData } from "types";
import { useTransactionActions } from "./useTransactionActions";

export const useTransactionWatcher = (): void => {
  const { changeTransaction } = useTransactionActions();
  const transactionHistory = useAtomValue(myTransactionHistoryAtom);
  const pendingTransactions = useMemo(() => {
    return transactionHistory.filter(filterPendingTransactions);
  }, [transactionHistory]);

  useQuery({
    queryKey: ["transaction-status", pendingTransactions],
    enabled: pendingTransactions.length > 0,
    queryFn: async () => {
      return Promise.allSettled(
        pendingTransactions.map(async (tx) => {
          await updateIbcTransactionStatus(
            tx.rpc,
            tx as IbcTransferTransactionData,
            changeTransaction
          );
        })
      );
    },
    refetchInterval: 50000,
  });
};
