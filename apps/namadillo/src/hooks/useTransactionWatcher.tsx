import { StargateClient } from "@cosmjs/stargate";
import { useQuery } from "@tanstack/react-query";
import { queryForAck, queryForIbcTimeout } from "atoms/transactions";
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
      for (const tx of pendingTransactions) {
        const client = await StargateClient.connect(tx.rpc);
        const ibcTx = tx as IbcTransferTransactionData;
        const successQueries = await queryForAck(client, ibcTx);

        if (successQueries.length > 0) {
          changeTransaction(ibcTx.hash, {
            status: "success",
            progressStatus: "complete",
            resultTxHash: successQueries[0].hash,
          });
          continue;
        }

        const timeoutQuery = await queryForIbcTimeout(
          client,
          tx as IbcTransferTransactionData
        );

        if (timeoutQuery.length > 0) {
          changeTransaction(ibcTx.hash, {
            status: "error",
            errorMessage: "Transaction timed out",
            resultTxHash: timeoutQuery[0].hash,
          });
          continue;
        }
      }
    },
    refetchInterval: 50000,
  });
};
