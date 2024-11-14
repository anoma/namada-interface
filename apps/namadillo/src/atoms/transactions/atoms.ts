import { defaultAccountAtom } from "atoms/accounts";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Address, TransferTransactionData } from "types";
import {
  filterCompleteTransactions,
  filterPendingTransactions,
} from "./functions";

export const transactionHistoryAtom = atomWithStorage<
  Record<Address, TransferTransactionData[]>
>("namadillo:transactions", {});

export const myTransactionHistoryAtom = atom<TransferTransactionData[]>(
  (get) => {
    const transactions = get(transactionHistoryAtom);
    const account = get(defaultAccountAtom);
    if (!account || !account.data?.address) return [];
    return transactions[account.data.address] || [];
  }
);

export const pendingTransactionsHistoryAtom = atom((get) => {
  const myTransactions = get(myTransactionHistoryAtom);
  return myTransactions.filter(filterPendingTransactions);
});

export const completeTransactionsHistoryAtom = atom((get) => {
  const myTransactions = get(myTransactionHistoryAtom);
  return myTransactions.filter(filterCompleteTransactions);
});
