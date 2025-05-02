import { TokenCurrency } from "App/Common/TokenCurrency";
import { parseChainInfo } from "App/Transfer/common";
import { chainRegistryAtom } from "atoms/integrations";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { GoIssueClosed, GoIssueTrackedBy, GoXCircle } from "react-icons/go";
import { ImCheckmark } from "react-icons/im";
import { twMerge } from "tailwind-merge";
import {
  ibcTransferStages,
  IbcTransferTransactionData,
  namadaTransferStages,
  TransferTransactionData,
} from "types";

type TransactionCardProps = {
  transaction: TransferTransactionData;
};

const getTitle = (transferTransaction: TransferTransactionData): string => {
  const { type } = transferTransaction;

  if (Object.keys(namadaTransferStages).includes(type)) {
    return "Transfer";
  }

  if (Object.keys(ibcTransferStages).includes(type)) {
    return "Transfer IBC";
  }

  return "";
};

export const PendingTransactionCard = ({
  transaction,
}: TransactionCardProps): JSX.Element => {
  const availableChains = useAtomValue(chainRegistryAtom);
  const isIbc = Object.keys(ibcTransferStages).includes(transaction.type);

  const chainId =
    isIbc ?
      (transaction as IbcTransferTransactionData).destinationChainId
    : transaction.chainId;

  const chainName =
    chainId in availableChains ?
      parseChainInfo(availableChains[chainId].chain)?.pretty_name
    : chainId;

  return (
    <ul className="flex flex-col gap-2">
      <li>
        <article
          className={twMerge(
            clsx(
              "grid grid-cols-[min-content_auto_min-content] items-center",
              "gap-5 bg-neutral-800 rounded-sm px-5 py-5 text-white border border-transparent",
              "transition-colors duration-200 hover:border-neutral-500",
              { "border-yellow": transaction.status === "pending" }
            )
          )}
        >
          <i
            className={twMerge(
              clsx("text-2xl text-yellow", {
                "text-fail": transaction.status === "error",
              })
            )}
          >
            {transaction.status === "success" && <GoIssueClosed />}
            {transaction.status === "pending" && <GoIssueTrackedBy />}
            {transaction.status === "error" && <GoXCircle />}
          </i>
          <div>
            <h3>{getTitle(transaction)}</h3>
            <p className="text-sm text-neutral-400">
              <TokenCurrency
                className="text-white"
                amount={transaction.displayAmount}
                symbol={transaction.asset.symbol}
              />{" "}
              to {chainName} {transaction.destinationAddress}
            </p>
          </div>
          <i className={twMerge(clsx("text-white text-xl"))}>
            {transaction.status === "success" && <ImCheckmark />}
          </i>
        </article>
      </li>
    </ul>
  );
};
