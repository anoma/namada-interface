import { Panel } from "@namada/components";
import { NavigationFooter } from "App/AccountOverview/NavigationFooter";
import {
  completeTransactionsHistoryAtom,
  myTransactionHistoryAtom,
  pendingTransactionsHistoryAtom,
} from "atoms/transactions/atoms";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useAtomValue } from "jotai";
import { TransactionList } from "./TransactionHistoryList";

export const TransactionHistory = (): JSX.Element => {
  const transactions = useAtomValue(myTransactionHistoryAtom);
  const pending = useAtomValue(pendingTransactionsHistoryAtom);
  const complete = useAtomValue(completeTransactionsHistoryAtom);
  const hasNoTransactions = transactions.length === 0;
  const { clearMyCompleteTransactions } = useTransactionActions();

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ height: "calc(100vh - 180px)" }}
    >
      <Panel className="flex-auto flex flex-col overflow-auto">
        <div className="rounded-sm bg-black px-4 py-5 text-white font-medium flex flex-col gap-6 flex-1">
          <h2 className="mb-7">Transfers made by this device</h2>
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm mb-3">In Progress</h2>
              <TransactionList transactions={pending.toReversed()} />
            </section>
          )}
          {complete.length > 0 && (
            <section>
              <header className="flex justify-between text-sm">
                <h2 className="mb-3">History</h2>
                <button
                  className="text-white"
                  onClick={clearMyCompleteTransactions}
                >
                  Clear all
                </button>
              </header>
              <TransactionList transactions={complete.toReversed()} />
            </section>
          )}
          {hasNoTransactions && (
            <p className="font-light">No transactions saved on this device</p>
          )}
        </div>
      </Panel>
      <NavigationFooter className="mt-2 flex-none h-16" />
    </div>
  );
};
