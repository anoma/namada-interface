import { StargateClient } from "@cosmjs/stargate";
import { useQuery } from "@tanstack/react-query";
import { transactionHistoryAtom } from "atoms/transactions/atoms";
import { filterPendingTransactions } from "atoms/transactions/functions";
import { useAtom } from "jotai";
import { useMemo } from "react";

export const useTransactionWatcher = (): void => {
  const [transactionHistory, _setTransactionHistory] = useAtom(
    transactionHistoryAtom
  );

  const pendingTransactions = useMemo(() => {
    return transactionHistory.filter(filterPendingTransactions);
  }, [transactionHistory]);

  useQuery({
    queryKey: ["transaction-status", pendingTransactions],
    queryFn: async () => {
      for (const tx of pendingTransactions) {
        const client = await StargateClient.connect(tx.rpc);
        const _info = await client.getTx(tx.hash);
      }
    },
    refetchInterval: 1000,
  });
};
