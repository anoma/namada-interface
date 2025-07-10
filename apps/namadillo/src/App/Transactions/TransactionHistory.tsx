import { Panel, StyledSelectBox, TableRow } from "@namada/components";
import { NavigationFooter } from "App/AccountOverview/NavigationFooter";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import { chainParametersAtom } from "atoms/chain";
import {
  chainTransactionHistoryFamily,
  completeTransactionsHistoryAtom,
  pendingTransactionsHistoryAtom,
  TransactionHistory as TransactionHistoryType,
} from "atoms/transactions/atoms";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { TransferTransactionData } from "types";
import { BundledTransactionCard } from "./BundledTransactionCard";
import { LocalStorageTransactionCard } from "./LocalStorageTransactionCard";
import { PendingTransactionCard } from "./PendingTransactionCard";
import { TransactionCard } from "./TransactionCard";

const ITEMS_PER_PAGE = 30;
export const transferKindOptions = [
  "transparentTransfer",
  "shieldingTransfer",
  "unshieldingTransfer",
  "shieldedTransfer",
  "ibcTransparentTransfer",
  "ibcShieldingTransfer",
  "ibcUnshieldingTransfer",
  "ibcShieldedTransfer",
  "redelegation",
  "voteProposal",
  "withdraw",
  "bond",
  "unbond",
  "revealPk",
  "received",
];

type BundledTransaction =
  | {
      type: "bundled";
      revealPkTx: TransactionHistoryType;
      mainTx: TransactionHistoryType;
      timestamp: number;
    }
  | {
      type: "single";
      tx: TransactionHistoryType;
      timestamp: number;
    };

export const TransactionHistory = (): JSX.Element => {
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState("All");
  const pending = useAtomValue(pendingTransactionsHistoryAtom);
  const { data: transactions, isLoading } = useAtomValue(
    chainTransactionHistoryFamily({ perPage: ITEMS_PER_PAGE, fetchAll: true })
  );
  const chainParameters = useAtomValue(chainParametersAtom);
  const chainId = chainParameters.data?.chainId;
  const completedIbcTransactions = useAtomValue(
    completeTransactionsHistoryAtom
  );

  const completedIbcShieldTransactions = completedIbcTransactions
    .filter((transaction) => {
      const acceptedTypes = ["IbcToShielded", "ShieldedToIbc"];
      const isAcceptedType = acceptedTypes.includes(transaction.type);
      const isAcceptedChain =
        transaction.destinationChainId === chainId ||
        transaction.chainId === chainId;
      const isAcceptedFilter =
        filter === "ibc" || filter.toLowerCase() === "all";
      return isAcceptedType && isAcceptedChain && isAcceptedFilter;
    })
    .map((transaction) => ({
      ...transaction,
      timestamp: new Date(transaction.updatedAt).getTime() / 1000,
    }));

  const handleFiltering = (transaction: TransactionHistoryType): boolean => {
    const transactionKind = transaction.tx?.kind ?? "";
    switch (filter.toLowerCase()) {
      case "all":
        return transferKindOptions.includes(transactionKind);
      case "received":
        return transaction.kind === "received";
      case "redelegation":
        return transactionKind === "redelegation";
      case "vote":
        return transactionKind === "voteProposal";
      case "withdraw":
        return transactionKind === "withdraw";
      case "transfer":
        return [
          "transparentTransfer",
          "shieldingTransfer",
          "unshieldingTransfer",
          "shieldedTransfer",
        ].includes(transactionKind);
      case "ibc":
        return transactionKind.startsWith("ibc");
      default:
        return transactionKind === filter;
    }
  };

  const filterDuplicateTransactions = (
    transactions: TransactionHistoryType[]
  ): TransactionHistoryType[] => {
    const seen = new Set();
    return transactions.filter((tx) => {
      if (tx.kind !== "received") return true;
      try {
        const data =
          tx.tx?.data?.startsWith("[") ?
            JSON.parse(tx.tx.data)[1] || JSON.parse(tx.tx.data)[0]
          : JSON.parse(tx.tx?.data ?? "{}");
        const key = JSON.stringify({
          blockHeight: tx.block_height,
          target: tx.target,
          sources: (data.sources || [])
            .map((s: Record<string, string>) => ({
              owner: s.owner,
              token: s.token,
              amount: s.amount,
              type: s.type,
            }))
            .sort(),
          targets: (data.targets || [])
            .map((t: Record<string, string>) => ({
              owner: t.owner,
              token: t.token,
              amount: t.amount,
              type: t.type,
            }))
            .sort(),
        });
        return seen.has(key) ? false : seen.add(key);
      } catch {
        return true;
      }
    });
  };

  // Bundle reveal PK transactions with the previous transaction
  const bundleTransactions = (
    transactions: (TransactionHistoryType | TransferTransactionData)[]
  ): BundledTransaction[] => {
    const bundled: BundledTransaction[] = [];
    let i = 0;

    while (i < transactions.length) {
      const currentTx = transactions[i];

      // Check if next transaction is revealPk that should be bundled with current
      const nextTx = transactions[i + 1];
      if (
        i + 1 < transactions.length &&
        "tx" in nextTx &&
        nextTx.tx?.kind === "revealPk"
      ) {
        bundled.push({
          type: "bundled",
          revealPkTx: nextTx as TransactionHistoryType,
          mainTx: currentTx as TransactionHistoryType,
          timestamp: currentTx.timestamp || 0,
        });
        i += 2; // Skip both transactions
      } else if ("tx" in currentTx && currentTx.tx?.kind === "revealPk") {
        // Skip standalone revealPk transactions
        i += 1;
      } else {
        // Add as single transaction
        bundled.push({
          type: "single",
          tx: currentTx as TransactionHistoryType,
          timestamp: currentTx.timestamp || 0,
        });
        i += 1;
      }
    }

    return bundled;
  };

  const filteredTransactions =
    transactions?.results?.filter((transaction) =>
      handleFiltering(transaction)
    ) ?? [];

  const historicalTransactions =
    filterDuplicateTransactions(filteredTransactions);

  const allHistoricalTransactions = [
    ...historicalTransactions,
    ...completedIbcShieldTransactions,
  ].sort((a, b) => (b?.timestamp ?? 0) - (a?.timestamp ?? 0));

  // Bundle transactions after sorting
  const bundledTransactions = bundleTransactions(allHistoricalTransactions);

  // Calculate total pages based on bundled transactions
  const totalPages = Math.max(
    1,
    Math.ceil(bundledTransactions.length / ITEMS_PER_PAGE)
  );

  const paginatedTransactions = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return bundledTransactions.slice(startIndex, endIndex);
  }, [bundledTransactions, currentPage]);

  const renderRow = (
    transaction: BundledTransaction,
    index: number
  ): TableRow => {
    const key =
      transaction.type === "bundled" ?
        `${transaction.revealPkTx.tx?.txId}-${transaction.mainTx.tx?.txId}`
      : transaction.tx.tx?.txId || index.toString();

    return {
      key,
      cells: [
        transaction.type === "bundled" ?
          <BundledTransactionCard
            key="bundled-transaction"
            revealPkTx={transaction.revealPkTx}
            mainTx={transaction.mainTx}
          />
        : transaction.tx?.tx ?
          <TransactionCard key="transaction" tx={transaction.tx} />
        : <LocalStorageTransactionCard
            key="transaction"
            transaction={transaction.tx as unknown as TransferTransactionData}
          />,
      ],
    };
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <Panel className="relative overflow-hidden flex flex-col flex-1">
        {pending.length > 0 && (
          <div className="mb-5 flex-none">
            <h2 className="text-sm mb-3 ml-4">Pending</h2>
            <div className="ml-4 mr-7 max-h-32 overflow-y-auto dark-scrollbar">
              {pending.map((transaction) => (
                <PendingTransactionCard
                  key={transaction.hash}
                  transaction={transaction}
                />
              ))}
            </div>
          </div>
        )}

        {isLoading ?
          <i
            className={clsx(
              "absolute w-8 h-8 top-0 left-0 right-0 bottom-0 m-auto border-4",
              "border-transparent border-t-yellow rounded-[50%]",
              "animate-loadingSpinner"
            )}
          />
        : <section className="flex flex-col flex-1 overflow-hidden min-h-0">
            <header className="text-sm ml-4 flex-none">
              <h2>History</h2>
            </header>
            <div className="flex items-center justify-between mx-4 mt-2 gap-4 mb-2">
              <StyledSelectBox
                id="transfer-kind-filter"
                defaultValue="All"
                value={filter}
                containerProps={{
                  className: clsx(
                    "text-sm min-w-[200px] border border-white rounded-sm",
                    "px-4 py-[9px]"
                  ),
                }}
                arrowContainerProps={{ className: "right-4" }}
                listContainerProps={{
                  className:
                    "w-[200px] mt-2 border border-white left-0 transform-none max-h-[200px] overflow-y-auto dark-scrollbar",
                }}
                listItemProps={{
                  className: "text-sm border-0 py-0 [&_label]:py-1.5",
                }}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(0);
                }}
                options={[
                  {
                    id: "all",
                    value: "All",
                    ariaLabel: "All",
                  },
                  {
                    id: "transfer",
                    value: "Transfer",
                    ariaLabel: "Transfer",
                  },
                  {
                    id: "ibc",
                    value: "IBC",
                    ariaLabel: "IBC",
                  },
                  {
                    id: "bond",
                    value: "Stake",
                    ariaLabel: "Stake",
                  },
                  {
                    id: "unbond",
                    value: "Unstake",
                    ariaLabel: "Unstake",
                  },
                  {
                    id: "redelegation",
                    value: "Redelegate",
                    ariaLabel: "Redelegate",
                  },
                  {
                    id: "voteProposal",
                    value: "Vote",
                    ariaLabel: "Vote",
                  },
                  {
                    id: "withdraw",
                    value: "Withdraw",
                    ariaLabel: "Withdraw",
                  },
                ]}
              />
              <div className="flex items-center bg-yellow/10 border border-yellow/30 rounded-sm px-3 py-2 mr-3 text-xs text-yellow-600 dark:text-yellow-400">
                <svg
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Shielded-transaction history lives only in this
                  browser—switching URL, browser, or device will hide past
                  shielded txs.
                </span>
              </div>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex flex-col flex-1 overflow-auto">
                <TableWithPaginator
                  id="transactions-table"
                  headers={[{ children: " ", className: "w-full" }]}
                  renderRow={renderRow}
                  itemList={paginatedTransactions}
                  page={currentPage}
                  pageCount={totalPages}
                  onPageChange={handlePageChange}
                  tableProps={{
                    className: twMerge(
                      "border-none w-full",
                      "[&>tbody>tr:nth-child(odd)]:bg-transparent",
                      "[&>tbody>tr:nth-child(even)]:bg-transparent",
                      "w-full [&_td]:px-1 [&_th]:px-1 [&_td:first-child]:pl-4 [&_td]:h-[64px]",
                      "[&_td]:font-normal [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4",
                      "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md"
                    ),
                  }}
                />
              </div>
            </div>
          </section>
        }
      </Panel>
      <NavigationFooter className="flex-none h-14 mt-2" />
    </div>
  );
};
