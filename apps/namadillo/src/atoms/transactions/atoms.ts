import { Pagination, TransactionHistory } from "@namada/indexer-client";
import { allDefaultAccountsAtom, defaultAccountAtom } from "atoms/accounts";
import { indexerApiAtom } from "atoms/api";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomWithStorage } from "jotai/utils";
import { Address, TransferTransactionData } from "types";
import {
  filterCompleteTransactions,
  filterPendingTransactions,
} from "./functions";
import { fetchHistoricalTransactions, fetchTransaction } from "./services";

export const transactionStorageKey = "namadillo:transactions";

export const transactionHistoryAtom = atomWithStorage<
  Record<Address, TransferTransactionData[]>
>(transactionStorageKey, {});

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

export const fetchTransactionAtom = atom((get) => {
  const api = get(indexerApiAtom);
  return (hash: string) => fetchTransaction(api, hash);
});

export const chainTransactionHistoryAtom = atomWithQuery<{
  results: TransactionHistory[];
  pagination: Pagination;
}>((get) => {
  const api = get(indexerApiAtom);
  const accounts = get(allDefaultAccountsAtom);
  const addresses = accounts.data?.map((acc) => acc.address);
  return {
    enabled: !!addresses, // Only run the query if we have addresses
    queryKey: ["chain-transaction-history", addresses],
    queryFn: async () => {
      if (!addresses) {
        return {
          results: [],
          pagination: {
            totalPages: "0",
            totalRecords: "0",
            currentPage: "0",
            recordsPerPage: "0",
          },
        };
      }
      return fetchHistoricalTransactions(api, addresses);
    },
  };
});
