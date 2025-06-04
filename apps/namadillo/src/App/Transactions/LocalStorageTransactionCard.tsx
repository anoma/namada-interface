import { CopyToClipboardControl, Tooltip } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { AssetImage } from "App/Transfer/AssetImage";
import { isShieldedAddress, isTransparentAddress } from "App/Transfer/common";
import clsx from "clsx";
import { FaInfoCircle, FaLock } from "react-icons/fa";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { TransferTransactionData } from "types";
import keplrSvg from "../../integrations/assets/keplr.svg";

type TransactionCardProps = {
  transaction: TransferTransactionData;
};

const getTitle = (transferTransaction: TransferTransactionData): string => {
  const { type } = transferTransaction;
  if (type === "IbcToShielded") return "IBC Shielding";
  if (type === "ShieldedToIbc") return "IBC Unshielding";
  return "";
};

export const LocalStorageTransactionCard = ({
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
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center my-1 font-semibold",
        "gap-5 bg-neutral-800 rounded-sm px-5 py-5 text-white border border-transparent",
        "transition-colors duration-200 hover:border-neutral-500"
      )}
    >
      <div className="flex items-center gap-3">
        <i className={twMerge("text-2xl, text-success")}>
          <IoCheckmarkCircleOutline className="ml-1 mt-0.5 w-10 h-10" />
        </i>

        <div className="flex flex-col">
          <h3 className="text-success flex relative group/tooltip">
            {getTitle(transaction)}{" "}
            <CopyToClipboardControl
              className="ml-1.5 text-neutral-400"
              value={transaction?.hash ?? ""}
            />
            <Tooltip position="right" className="p-2 w-[150px] z-10">
              Copy transaction hash
            </Tooltip>
          </h3>
          <h3 className="text-neutral-400">
            {new Date(transaction.createdAt).toLocaleString("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </h3>
        </div>
      </div>

      <div className="flex items-center">
        <div className="aspect-square w-10 h-10">
          <AssetImage asset={transaction.asset} />
        </div>
        <TokenCurrency
          className="text-white mt-1 ml-2"
          amount={transaction.displayAmount}
          symbol={transaction.asset.symbol}
        />
      </div>
      <div className="flex flex-col">
        <h4
          className={
            (
              isShieldedAddress(sender ?? "") ||
              transaction.type === "ShieldedToIbc"
            ) ?
              "text-yellow"
            : ""
          }
        >
          From
        </h4>
        <h4
          className={
            (
              isShieldedAddress(sender ?? "") ||
              transaction.type === "ShieldedToIbc"
            ) ?
              "text-yellow"
            : ""
          }
        >
          {(
            isShieldedAddress(sender ?? "") ||
            transaction.type === "ShieldedToIbc"
          ) ?
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

      <div className="flex flex-col relative">
        <h4 className={isShieldedAddress(receiver ?? "") ? "text-yellow" : ""}>
          To
        </h4>
        <div className="flex items-center justify-between">
          <h4
            className={isShieldedAddress(receiver ?? "") ? "text-yellow" : ""}
          >
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
          <div className="relative group/tooltip">
            <FaInfoCircle className="w-4 h-4 mb-3 mr-4" />
            <Tooltip position="left" className="p-2 w-[200px] z-10">
              This transaction is stored locally. It may not appear when viewing
              your history on other devices.
            </Tooltip>
          </div>
        </div>
      </div>
    </article>
  );
};
