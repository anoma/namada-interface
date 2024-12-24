import { useQuery } from "@tanstack/react-query";
import {
  updateIbcTransferStatus,
  updateIbcWithdrawalStatus,
} from "atoms/integrations";
import { pendingTransactionsHistoryAtom } from "atoms/transactions";
import { useAtomValue } from "jotai";
import { IbcTransferTransactionData } from "types";
import { useTransactionActions } from "./useTransactionActions";

export const useTransactionWatcher = (): void => {
  const { changeTransaction } = useTransactionActions();
  const pendingTransactions = useAtomValue(pendingTransactionsHistoryAtom);

  useQuery({
    queryKey: ["transaction-status", pendingTransactions],
    enabled: pendingTransactions.length > 0,
    queryFn: async () => {
      return Promise.allSettled(
        pendingTransactions.map(async (tx) => {
          switch (tx.type) {
            case "IbcToTransparent":
            case "IbcToShielded":
              await updateIbcTransferStatus(
                tx.rpc,
                tx as IbcTransferTransactionData,
                changeTransaction
              );
              break;
            case "TransparentToIbc":
              await updateIbcWithdrawalStatus(
                tx as IbcTransferTransactionData,
                changeTransaction
              );
              break;
          }
        })
      );
    },
    refetchInterval: 5000,
  });
};
