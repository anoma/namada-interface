import { defaultAccountAtom } from "atoms/accounts";
import {
  myTransactionHistoryAtom,
  transactionHistoryAtom,
} from "atoms/transactions/atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { Address, TransferTransactionData } from "types";

type UseTransactionActionsOutput = {
  transactions: TransferTransactionData[];
  findByHash: (hash: string) => TransferTransactionData | undefined;
  storeTransaction: (tx: TransferTransactionData) => void;
  changeTransaction: (
    hash: string,
    updatedTx: Partial<TransferTransactionData>,
    sourceAddress?: Address
  ) => void;
};

export const useTransactionActions = (): UseTransactionActionsOutput => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const setTransactions = useSetAtom(transactionHistoryAtom);
  const transactions = useAtomValue(myTransactionHistoryAtom);

  const storeTransaction = (tx: TransferTransactionData): void => {
    setTransactions((txs) => {
      if (!account) return txs;
      const obj = txs[account.address] || [];
      return {
        ...txs,
        [account.address]: [...obj, { ...tx }],
      };
    });
  };

  const changeTransaction = (
    hash: string,
    updatedTx: Partial<TransferTransactionData>,
    sourceAccountAddress?: Address
  ): void => {
    setTransactions((txByAccount) => {
      const sourceAddress = sourceAccountAddress || account?.address;
      if (!sourceAddress) return txByAccount;

      const txs = txByAccount[sourceAddress] || [];
      if (!txs) return txByAccount;

      return {
        ...txByAccount,
        [sourceAddress]: txs.map((tx) =>
          tx.hash === hash ?
            ({ ...tx, ...updatedTx } as TransferTransactionData)
          : tx
        ),
      };
    });
  };

  const findByHash = (hash: string): undefined | TransferTransactionData => {
    return transactions.find((t) => t.hash === hash);
  };

  return {
    transactions,
    findByHash,
    storeTransaction,
    changeTransaction,
  };
};
