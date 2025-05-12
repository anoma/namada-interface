import { Pagination, TransactionHistory } from "@namada/indexer-client";
import { allDefaultAccountsAtom, defaultAccountAtom } from "atoms/accounts";
import { indexerApiAtom } from "atoms/api";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily, atomWithStorage } from "jotai/utils";
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

// New atom family for paginated transaction history
export const chainTransactionHistoryFamily = atomFamily(
  (options?: { page?: number; perPage?: number; fetchAll?: boolean }) =>
    atomWithQuery<{
      results: TransactionHistory[];
      pagination: Pagination;
    }>((get) => {
      const api = get(indexerApiAtom);
      const accounts = get(allDefaultAccountsAtom);
      const addresses = accounts.data?.map((acc) => acc.address);

      return {
        enabled: !!addresses, // Only run the query if we have addresses
        queryKey: [
          "chain-transaction-history",
          addresses,
          options?.fetchAll ? "all" : options?.page,
          options?.perPage,
        ],
        queryFn: async () => {
          if (!addresses) {
            return {
              results: [],
              pagination: {
                totalPages: "0",
                totalItems: "0",
                currentPage: "0",
                perPage: "0",
              },
            };
          }

          // If fetchAll is true, we'll get all pages
          if (options?.fetchAll) {
            // First fetch to get pagination info
            const firstPageResult = await fetchHistoricalTransactions(
              api,
              addresses,
              1,
              options?.perPage || 10
            );

            const totalPages = parseInt(
              firstPageResult.pagination?.totalPages || "0"
            );

            // If there's only one page, return the first result
            if (totalPages <= 1) {
              return firstPageResult;
            }

            // Otherwise, fetch all remaining pages
            const allPagePromises = [];
            // We already have page 1
            const allResults = [...firstPageResult.results];

            // Fetch pages 2 to totalPages
            for (let page = 2; page <= totalPages; page++) {
              allPagePromises.push(
                fetchHistoricalTransactions(
                  api,
                  addresses,
                  page,
                  options?.perPage || 10
                )
              );
            }

            const allPagesResults = await Promise.all(allPagePromises);

            // Combine all results
            for (const pageResult of allPagesResults) {
              allResults.push(...pageResult.results);
            }

            // Return combined results with updated pagination info
            return {
              results: allResults,
              pagination: {
                ...firstPageResult.pagination,
                totalPages: totalPages.toString(),
                currentPage: "all", // Indicate we fetched all pages
              },
            };
          }

          // Standard case: fetch a single page
          return fetchHistoricalTransactions(
            api,
            addresses,
            options?.page,
            options?.perPage
          );
        },
      };
    }),
  (a, b) =>
    // Equality check for memoization - include fetchAll in comparison
    a?.page === b?.page &&
    a?.perPage === b?.perPage &&
    a?.fetchAll === b?.fetchAll
);
