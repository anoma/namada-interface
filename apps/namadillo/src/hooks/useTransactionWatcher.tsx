import { WrapperTransactionExitCodeEnum } from "@namada/indexer-client";
import { useQuery } from "@tanstack/react-query";
import {
  updateIbcTransferStatus,
  updateIbcWithdrawalStatus,
} from "atoms/integrations";
import {
  fetchTransactionAtom,
  pendingTransactionsHistoryAtom,
} from "atoms/transactions";
import { useAtomValue } from "jotai";
import { IbcTransferTransactionData, TransferStep } from "types";
import { useTransactionActions } from "./useTransactionActions";

export const useTransactionWatcher = (): void => {
  const { changeTransaction } = useTransactionActions();
  const pendingTransactions = useAtomValue(pendingTransactionsHistoryAtom);
  const fetchTransaction = useAtomValue(fetchTransactionAtom);

  useQuery({
    queryKey: ["transaction-status", pendingTransactions],
    enabled: pendingTransactions.length > 0,
    queryFn: async () => {
      return Promise.allSettled(
        pendingTransactions.map(async (tx) => {
          switch (tx.type) {
            case "TransparentToTransparent":
            case "TransparentToShielded":
            case "ShieldedToTransparent":
            case "ShieldedToShielded":
              {
                const hash = tx.hash ?? "";
                const response = await fetchTransaction(hash);
                const hasRejectedTx = response.innerTransactions.find(
                  ({ exitCode }) =>
                    // indexer api is returning as "Rejected", but sdk type is "rejected"
                    exitCode.toLowerCase() ===
                    WrapperTransactionExitCodeEnum.Rejected.toLowerCase()
                );
                if (hasRejectedTx) {
                  changeTransaction(hash, {
                    status: "error",
                    errorMessage: "Transaction rejected",
                  });
                } else {
                  changeTransaction(hash, {
                    status: "success",
                    currentStep: TransferStep.Complete,
                  });
                }
              }
              break;

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
