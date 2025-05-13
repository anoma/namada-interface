import { CopyToClipboardControl } from "@namada/components";
import { TransactionHistory as TransactionHistoryType } from "@namada/indexer-client";
import { shortenAddress } from "@namada/utils";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { AssetImage } from "App/Transfer/AssetImage";
import { isShieldedAddress, isTransparentAddress } from "App/Transfer/common";
import { indexerApiAtom } from "atoms/api";
import { fetchBlockTimestampByHeight } from "atoms/balance/services";
import { chainAssetsMapAtom } from "atoms/chain";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { FaLock } from "react-icons/fa6";
import {
  IoArrowBack,
  IoArrowForward,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { toDisplayAmount } from "utils";
import keplrSvg from "../../integrations/assets/keplr.svg";

type Tx = TransactionHistoryType;
type Props = { tx: Tx };
type RawDataSection = {
  amount?: string;
  sources?: Array<{ amount: string; owner: string }>;
  targets?: Array<{ amount: string; owner: string }>;
};
const IBC_PREFIX = "ibc";

export function getToken(txn: Tx["tx"]): string | undefined {
  const parsed = txn?.data ? JSON.parse(txn.data) : undefined;
  if (!parsed) return undefined;
  const sections = Array.isArray(parsed) ? parsed : [parsed];

  // return the first token found in sources or targets
  for (const section of sections) {
    if (section.sources?.length) {
      return section.sources[0].token;
    }
    if (section.targets?.length) {
      return section.targets[0].token;
    }
  }

  return undefined;
}

const titleFor = (kind: string | undefined, isReceived: boolean): string => {
  if (!kind) return "Unknown";
  if (isReceived) return "Receive";
  if (kind.startsWith(IBC_PREFIX)) return "IBC Transfer";
  if (kind === "transparentTransfer") return "Transparent Transfer";
  if (kind === "shieldingTransfer") return "Shielding Transfer";
  if (kind === "unshieldingTransfer") return "Unshielding Transfer";
  if (kind === "shieldedTransfer") return "Shielded Transfer";
  return "Transfer";
};

export function getTransactionInfo(
  tx: Tx["tx"]
): { amount: BigNumber; sender?: string; receiver?: string } | undefined {
  if (!tx?.data) return undefined;

  const parsed = typeof tx.data === "string" ? JSON.parse(tx.data) : tx.data;
  const sections: RawDataSection[] = Array.isArray(parsed) ? parsed : [parsed];

  let sender: string | undefined;
  let receiver: string | undefined;
  let amount: BigNumber | undefined;

  for (const sec of sections) {
    if (!amount && sec.targets?.[0]?.amount) {
      amount = new BigNumber(sec.targets[0].amount);
      receiver = sec.targets[0].owner;
    }
    if (!amount && sec.sources?.[0]?.amount) {
      amount = new BigNumber(sec.sources[0].amount);
    }
    if (!sender && sec.sources?.[0]?.owner) {
      sender = sec.sources[0].owner;
    }
    if (amount && (sender || receiver)) break; // we have what we need
  }

  return amount ? { amount, sender, receiver } : undefined;
}

export const TransactionCard = ({ tx }: Props): JSX.Element => {
  const transactionTopLevel = tx;
  const transaction = transactionTopLevel.tx;
  const isReceived = transactionTopLevel?.kind === "received";
  const token = getToken(transaction);
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);
  const asset = token ? chainAssetsMap[token] : undefined;
  const txnInfo = getTransactionInfo(transaction);
  const baseAmount =
    asset && txnInfo?.amount ?
      toDisplayAmount(asset, txnInfo.amount)
    : undefined;
  const receiver = txnInfo?.receiver;
  const sender = txnInfo?.sender;
  const transactionFailed = transaction?.exitCode === "rejected";
  const api = useAtomValue(indexerApiAtom);
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined);

  useEffect(() => {
    const getBlockTimestamp = async (): Promise<void> => {
      // TODO: need to update the type on indexer
      // @ts-expect-error need to update the type on indexer
      if (transactionTopLevel?.blockHeight && api) {
        try {
          const timestamp = await fetchBlockTimestampByHeight(
            api,
            // @ts-expect-error need to update the type on indexer
            transactionTopLevel.blockHeight
          );
          setTimestamp(timestamp);
        } catch (error) {
          console.error("Failed to fetch block height:", error);
        }
      }
    };

    getBlockTimestamp();
    // @ts-expect-error need to update the type on indexer
  }, [api, transactionTopLevel?.blockHeight]);

  const renderKeplrIcon = (address: string): JSX.Element | null => {
    if (isShieldedAddress(address)) return null;
    if (isTransparentAddress(address)) return null;
    return <img src={keplrSvg} height={18} width={18} />;
  };

  return (
    <article
      className={twMerge(
        clsx(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center my-1 font-semibold",
          "gap-5 bg-neutral-800 rounded-sm px-5 py-5 text-white border border-transparent",
          "transition-colors duration-200 hover:border-neutral-500"
        )
      )}
    >
      <div className="flex items-center gap-3">
        <i
          className={twMerge(
            clsx("text-2xl", {
              "text-success": !transactionFailed,
              "text-fail": transactionFailed,
            })
          )}
        >
          {isReceived && <IoArrowBack width={20} height={20} />}
          {!isReceived && <IoArrowForward width={20} height={20} />}
        </i>

        <div className="flex flex-col">
          <h3
            className={twMerge(
              clsx("flex", {
                "text-success": !transactionFailed,
                "text-fail": transactionFailed,
              })
            )}
          >
            {titleFor(transaction?.kind, isReceived)}{" "}
            {!transactionFailed && (
              <IoCheckmarkCircleOutline className="ml-1 mt-0.5 w-5 h-5" />
            )}
            {transactionFailed && (
              <IoCloseCircleOutline className="ml-1 mt-0.5 w-5 h-5" />
            )}
            <CopyToClipboardControl
              className="ml-1.5 text-neutral-400"
              value={transaction?.txId ?? ""}
            />
          </h3>
          <h3 className="text-neutral-400">
            {timestamp ?
              new Date(timestamp * 1000)
                .toLocaleString("en-US", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .replace(",", "")
            : "-"}
          </h3>
        </div>
      </div>

      <div className="flex items-center">
        <div className="aspect-square w-8 h-8">
          <AssetImage asset={asset} />
        </div>
        <TokenCurrency
          className="font-semibold text-white mt-1 ml-2"
          amount={baseAmount ?? BigNumber(0)}
          symbol={asset?.symbol ?? ""}
        />
      </div>

      <div className="flex flex-col">
        <h4 className={isShieldedAddress(sender ?? "") ? "text-yellow" : ""}>
          From
        </h4>
        <h4 className={isShieldedAddress(sender ?? "") ? "text-yellow" : ""}>
          {isShieldedAddress(sender ?? "") ?
            <span className="flex items-center gap-1">
              <FaLock className="w-4 h-4" /> znam
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
              <FaLock className="w-4 h-4" /> znam
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
