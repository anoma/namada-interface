import { Panel, TableRow } from "@namada/components";
import { TransactionHistory as TransactionHistoryType } from "@namada/indexer-client";
import { NavigationFooter } from "App/AccountOverview/NavigationFooter";
import { PageLoader } from "App/Common/PageLoader";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import {
  chainTransactionHistoryFamily,
  pendingTransactionsHistoryAtom,
} from "atoms/transactions/atoms";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
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
  "received",
];

export const TransactionHistory = (): JSX.Element => {
  const [currentPage, setCurrentPage] = useState(0);
  const pending = useAtomValue(pendingTransactionsHistoryAtom);
  const { data: transactions, isLoading } = useAtomValue(
    chainTransactionHistoryFamily({ perPage: ITEMS_PER_PAGE, fetchAll: true })
  );
  // Only show historical transactions that are in the transferKindOptions array
  const historicalTransactions =
    transactions?.results?.filter((transaction) =>
      transferKindOptions.includes(transaction.tx?.kind ?? "")
    ) ?? [];

  // Calculate total pages based on the filtered transactions
  const totalPages = Math.max(
    1,
    Math.ceil(historicalTransactions.length / ITEMS_PER_PAGE)
  );

  // Create paginated data for the current page
  const paginatedTransactions = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return historicalTransactions.slice(startIndex, endIndex);
  }, [historicalTransactions, currentPage]);

  const renderRow = (
    transaction: TransactionHistoryType,
    index: number
  ): TableRow => {
    return {
      key: transaction.tx?.txId || index.toString(),
      cells: [<TransactionCard key="transaction" tx={transaction} />],
    };
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <Panel className="relative overflow-hidden flex flex-col flex-1">
        <h2 className="mb-4 flex-none">All Transfers made</h2>

        {pending.length > 0 && (
          <div className="mb-5 flex-none">
            <h2 className="text-sm mb-3 ml-4">Pending</h2>
            <div className="ml-4 mr-7 max-h-32 overflow-y-auto">
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
          <PageLoader />
        : <section className="flex flex-col flex-1 overflow-hidden min-h-0">
            <header className="text-sm ml-4 flex-none">
              <h2>History</h2>
            </header>
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
            {historicalTransactions.length === 0 && (
              <p className="font-light ml-7">
                No transactions saved on this device
              </p>
            )}
          </section>
        }
      </Panel>
      <NavigationFooter className="flex-none h-14 mt-2" />
    </div>
  );
};
