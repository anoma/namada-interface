import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { TransferTransactionData } from "types";
import {
  filterCompleteTransactions,
  filterPendingTransactions,
} from "./functions";

export const transactionHistoryAtom = atomWithStorage<
  TransferTransactionData[]
>("namadillo:transactions", []);

export const pendingTransactionsHistoryAtom = atom((get) => {
  const transactions = get(transactionHistoryAtom);
  return transactions.filter(filterPendingTransactions);
});

export const completeTransactionsHistoryAtom = atom((get) => {
  const transactions = get(transactionHistoryAtom);
  return transactions.filter(filterCompleteTransactions);
});
