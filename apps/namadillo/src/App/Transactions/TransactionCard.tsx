import { TokenCurrency } from "App/Common/TokenCurrency";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { TransferTransactionData } from "types";
import { TransactionTransferTimeline } from "./TransactionTransferTimeline";

type TransactionCardProps = {
  transaction: TransferTransactionData;
};

const getTitle = (transferTransaction: TransferTransactionData): string => {
  switch (transferTransaction.type) {
    case "TransparentToTransparent":
    case "ShieldedToShielded":
    case "TransparentToShielded":
    case "ShieldedToTransparent":
      return "Transfer";

    case "IbcToTransparent":
    case "IbcToShielded":
    case "TransparentToIbc":
      return "Transfer IBC";

    default:
      return "";
  }
};

export const TransactionCard = ({
  transaction,
}: TransactionCardProps): JSX.Element => {
  return (
    <article
      className={twMerge(
        clsx(
          "grid grid-cols-[30px_auto_30px] items-center",
          "bg-neutral-800 rounded-sm px-5 py-6 text-white"
        )
      )}
    >
      <div>
        <i />
        <div>
          <h3>{getTitle(transaction)}</h3>
          <p>
            <TokenCurrency
              amount={transaction.amount}
              symbol={transaction.sourceCurrency}
            />
            <span className="text-neutral-300">
              to {transaction.destinationChain}
              {transaction.destinationAddress}
            </span>
          </p>
        </div>
        <i />
      </div>
      <TransactionTransferTimeline transaction={transaction} />
    </article>
  );
};
