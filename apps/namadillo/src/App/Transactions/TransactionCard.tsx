import { TransactionHistory } from "@namada/indexer-client";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { routes } from "App/routes";
import { parseChainInfo } from "App/Transfer/common";
import { chainRegistryAtom } from "atoms/integrations";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { GoIssueClosed, GoXCircle } from "react-icons/go";
import { ImCheckmark } from "react-icons/im";
import { generatePath, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import {
  ibcTransferStages,
  namadaTransferStages,
  TransferTransactionData,
} from "types";

type TransactionCardProps = {
  transaction: TransactionHistory["tx"];
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

export const TransactionCard = ({
  transaction,
}: TransactionCardProps): JSX.Element => {
  console.log(transaction, "txnnn");
  const navigate = useNavigate();
  const availableChains = useAtomValue(chainRegistryAtom);
  const isIbc = Object.keys(ibcTransferStages).includes(
    transaction?.kind ?? ""
  );

  const chainId =
    isIbc ? transaction?.destinationChainId : transaction?.chainId;

  const chainName =
    chainId in availableChains ?
      parseChainInfo(availableChains[chainId].chain)?.pretty_name
    : chainId;

  return (
    <article
      className={twMerge(
        clsx(
          "grid grid-cols-[min-content_auto_min-content] items-center cursor-pointer",
          "gap-5 bg-neutral-800 rounded-sm px-5 py-5 text-white border border-transparent",
          "transition-colors duration-200 hover:border-neutral-500",
          { "border-yellow": transaction.status === "pending" }
        )
      )}
      onClick={() =>
        transaction?.txId &&
        navigate(generatePath(routes.transaction, { hash: transaction.txId }))
      }
    >
      <i
        className={twMerge(
          clsx("text-2xl text-yellow", {
            "text-fail": transaction?.exitCode === "rejected",
          })
        )}
      >
        {transaction?.exitCode === "applied" && <GoIssueClosed />}
        {/* {transaction?.exitCode === "pending" && <GoIssueTrackedBy />} */}
        {transaction?.exitCode === "rejected" && <GoXCircle />}
      </i>
      <div>
        <h3>{getTitle(transaction)}</h3>
        <p className="text-sm text-neutral-400">
          <TokenCurrency
            className="text-white"
            amount={transaction?.displayAmount}
            symbol={transaction?.asset?.symbol ?? ""}
          />{" "}
          to {chainName} {transaction.destinationAddress}
        </p>
      </div>
      <i className={twMerge(clsx("text-white text-xl"))}>
        {transaction?.exitCode === "applied" && <ImCheckmark />}
      </i>
    </article>
  );
};
