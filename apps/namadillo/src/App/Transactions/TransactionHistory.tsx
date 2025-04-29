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
    <>
      <Panel className="flex flex-col gap-6 flex-1">
        <h2 className="mb-7">Transfers made by this device</h2>
        {/* {pending.length > 0 && (
          <section>
            <h2 className="text-sm mb-3">In Progress</h2>
            <TransactionList transactions={pending} />
          </section>
        )} */}
        {historicalTransactions.length > 0 && (
          <section className="w-full">
            <header className="text-sm ml-7">
              <h2 className="mb-3">History</h2>
            </header>
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
          </section>
        )}
        {hasNoTransactions && (
          <p className="font-light">No transactions saved on this device</p>
        )}
      </Panel>
      <NavigationFooter className="mt-2" />
    </>
  );
};
