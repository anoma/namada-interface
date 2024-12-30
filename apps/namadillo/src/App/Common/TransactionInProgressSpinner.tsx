import { Tooltip } from "@namada/components";
import { routes } from "App/routes";
import { pendingTransactionsHistoryAtom } from "atoms/transactions";
import { useAtomValue } from "jotai";
import { CgSpinner } from "react-icons/cg";
import { Link } from "react-router-dom";

export const TransactionInProgressSpinner = (): JSX.Element => {
  const pendingTransactions = useAtomValue(pendingTransactionsHistoryAtom);
  if (pendingTransactions.length === 0) return <></>;
  return (
    <div className="relative group/tooltip px-1 py-0.5">
      <Link to={routes.history} title={`View pending transactions`}>
        <i className="block animate-spin text-yellow text-sm">
          <CgSpinner />
        </i>
      </Link>
      <Tooltip position="top" className="w-[280px] justify-center">
        You have transactions being processed
      </Tooltip>
    </div>
  );
};
