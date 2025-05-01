import { Panel, TableRow } from "@namada/components";
import { TransactionHistory as TransactionHistoryType } from "@namada/indexer-client";
import { NavigationFooter } from "App/AccountOverview/NavigationFooter";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import {
  chainTransactionHistoryFamily,
  pendingTransactionsHistoryAtom,
} from "atoms/transactions/atoms";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { TransactionCard } from "./TransactionCard";

const ITEMS_PER_PAGE = 30;

export const TransactionHistory = (): JSX.Element => {
  const [currentPage, setCurrentPage] = useState(0);
  const pending = useAtomValue(pendingTransactionsHistoryAtom);
  const { data: transactions } = useAtomValue(
    chainTransactionHistoryFamily({
      page: currentPage + 1,
      perPage: ITEMS_PER_PAGE,
    })
  );

  const historicalTransactions = transactions?.results ?? [];
  const totalPages = parseInt(transactions?.pagination?.totalPages || "1", 10);

  console.log(transactions?.pagination, "ayyyyyy");
  const hasNoTransactions = historicalTransactions.length === 0;
  const { clearMyCompleteTransactions } = useTransactionActions();
  const headers = [{ children: " ", className: "w-full" }];

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
    <div
      className="flex flex-col h-full"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div className="flex-1 overflow-hidden min-h-0">
        <Panel className="flex flex-col gap-6 h-full">
          <h2 className="mb-7">Transfers made by this device</h2>

          {historicalTransactions.length > 0 && (
            <section className="flex flex-col flex-1 min-h-0">
              <header className="text-sm ml-7">
                <h2 className="mb-3">History</h2>
              </header>
              {/* Scrollable container for the table */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <TableWithPaginator
                  id="transactions-table"
                  headers={headers}
                  renderRow={renderRow}
                  itemList={historicalTransactions}
                  page={currentPage}
                  pageCount={totalPages}
                  onPageChange={handlePageChange}
                  tableProps={{
                    className: twMerge(
                      "border-none w-full",
                      "[&>tbody>tr:nth-child(odd)]:bg-transparent",
                      "[&>tbody>tr:nth-child(even)]:bg-transparent"
                    ),
                  }}
                />
              </div>
            </section>
          )}

          {hasNoTransactions && (
            <p className="font-light">No transactions saved on this device</p>
          )}
        </Panel>
      </div>
      <div className="mt-2">
        <NavigationFooter />
      </div>
    </div>
  );
};
