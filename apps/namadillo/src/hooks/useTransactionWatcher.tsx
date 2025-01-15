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
import { differenceInHours } from "date-fns";
import { useAtomValue } from "jotai";
import { IbcTransferTransactionData, TransferStep } from "types";
import { useTransactionActions } from "./useTransactionActions";

// After 2h the pending status will be changed to timeout
const pendingTimeout = 2;

const isError404 = (e: unknown): boolean =>
  typeof e === "object" && e !== null && "status" in e && e.status === 404;

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
                try {
                  const response = await fetchTransaction(hash);
                  const hasRejectedTx = response.innerTransactions.find(
                    ({ exitCode }) =>
                      exitCode === WrapperTransactionExitCodeEnum.Rejected
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
                } catch (e) {
                  if (
                    isError404(e) &&
                    differenceInHours(Date.now(), tx.createdAt) > pendingTimeout
                  ) {
                    changeTransaction(hash, {
                      status: "error",
                      errorMessage: "Transaction timed out",
                    });
                  }
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
    refetchInterval: 2000,
  });
};
