import { shortenAddress } from "@namada/utils";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { AssetImage } from "App/Transfer/AssetImage";
import { isShieldedAddress, isTransparentAddress } from "App/Transfer/common";
import clsx from "clsx";
import { FaLock } from "react-icons/fa";
import {
  IoArrowForward,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import {
  ibcTransferStages,
  namadaTransferStages,
  TransferTransactionData,
} from "types";
import keplrSvg from "../../integrations/assets/keplr.svg";

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
  const renderKeplrIcon = (address: string): JSX.Element | null => {
    if (isShieldedAddress(address)) return null;
    if (isTransparentAddress(address)) return null;
    return <img src={keplrSvg} height={18} width={18} />;
  };
  const sender = transaction.sourceAddress;
  const receiver = transaction.destinationAddress;
  return (
    <article
      className={clsx(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center my-2",
        "gap-5 bg-neutral-800 rounded-sm px-5 py-5 text-white border border-transparent",
        "transition-colors duration-200 hover:border-neutral-500 border-yellow"
      )}
    >
      <div className="flex items-center gap-3">
        <i
          className={clsx("text-2xl", {
            "text-success": transaction.status === "success",
            "text-fail": transaction.status === "error",
            "text-yellow": transaction.status === "pending",
          })}
        >
          <IoArrowForward width={20} height={20} />
        </i>

        <div className="flex flex-col">
          <h3
            className={clsx("flex", {
              "text-success": transaction.status === "success",
              "text-fail": transaction.status === "error",
              "text-yellow": transaction.status === "pending",
            })}
          >
            {getTitle(transaction)}{" "}
            {transaction.status === "success" && (
              <IoCheckmarkCircleOutline className="ml-1 mt-0.5 w-5 h-5" />
            )}
            {transaction.status === "error" && (
              <IoCloseCircleOutline className="ml-1 mt-0.5 w-5 h-5" />
            )}
          </h3>
          <h3 className="text-neutral-400">Pending</h3>
        </div>
      </div>

      <div className="flex items-center">
        <div className="aspect-square w-8 h-8">
          <AssetImage asset={transaction.asset} />
        </div>
        <TokenCurrency
          className="text-white mt-1 ml-2"
          amount={transaction.displayAmount}
          symbol={transaction.asset.symbol}
        />
      </div>
      <div className="flex flex-col">
        <h4 className={isShieldedAddress(sender ?? "") ? "text-yellow" : ""}>
          From
        </h4>
        <h4 className={isShieldedAddress(sender ?? "") ? "text-yellow" : ""}>
          {isShieldedAddress(sender ?? "") ?
            <span className="flex items-center gap-1">
              <FaLock className="w-4 h-4" /> Shielded
            </span>
          : <div className="flex items-center gap-1">
              {renderKeplrIcon(sender ?? "")}
              {shortenAddress(sender ?? "", 10, 10)}
            </div>
          }
        </h4>
      </div>

      <div className="flex flex-col">
        <h4 className={isShieldedAddress(receiver ?? "") ? "text-yellow" : ""}>
          To
        </h4>
        <h4 className={isShieldedAddress(receiver ?? "") ? "text-yellow" : ""}>
          {isShieldedAddress(receiver ?? "") ?
            <span className="flex items-center gap-1">
              <FaLock className="w-4 h-4" /> Shielded
            </span>
          : <div className="flex items-center gap-1">
              {renderKeplrIcon(receiver ?? "")}
              {shortenAddress(receiver ?? "", 10, 10)}
            </div>
          }
        </h4>
      </div>
    </article>
  );
};
