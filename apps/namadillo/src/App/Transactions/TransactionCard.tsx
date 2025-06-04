import { CopyToClipboardControl, Tooltip } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { AssetImage } from "App/Transfer/AssetImage";
import {
  isMaspAddress,
  isShieldedAddress,
  isTransparentAddress,
} from "App/Transfer/common";
import { chainAssetsMapAtom, nativeTokenAddressAtom } from "atoms/chain";
import { TransactionHistory as TransactionHistoryType } from "atoms/transactions/atoms";
import { allValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { FaLock } from "react-icons/fa6";
import {
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
type BondData = {
  amount: string;
  source: string;
  validator: string;
};

export function getToken(
  txn: Tx["tx"],
  nativeToken: string
): string | undefined {
  if (txn?.kind === "bond") return nativeToken;
  let parsed;
  try {
    parsed = txn?.data ? JSON.parse(txn.data) : undefined;
  } catch (error) {
    console.error("Failed to parse getToken data:", error);
  }
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

const getBondTransactionInfo = (
  tx: Tx["tx"]
): { amount: BigNumber; sender?: string; receiver?: string } | undefined => {
  if (!tx?.data) return undefined;

  let parsed: BondData;
  try {
    parsed = typeof tx.data === "string" ? JSON.parse(tx.data) : tx.data;
  } catch {
    return undefined;
  }
  return {
    amount: new BigNumber(parsed.amount ?? "0"),
    sender: parsed.source,
    receiver: parsed.validator,
  };
};
const getTransactionInfo = (
  tx: Tx["tx"]
): { amount: BigNumber; sender?: string; receiver?: string } | undefined => {
  if (!tx?.data) return undefined;

  const parsed = typeof tx.data === "string" ? JSON.parse(tx.data) : tx.data;
  const sections: RawDataSection[] = Array.isArray(parsed) ? parsed : [parsed];

  let receiver: string | undefined;
  let amount: BigNumber | undefined;

  // Find first section with targets or sources that has amount
  const targetSection = sections.find((sec) => sec.targets?.[0]?.amount);
  const sourceSection = sections.find((sec) => sec.sources?.[0]?.amount);

  if (targetSection?.targets?.[0]) {
    amount = new BigNumber(targetSection.targets[0].amount);
    receiver = targetSection.targets[0].owner;
  }

  if (!amount && sourceSection?.sources?.[0]) {
    amount = new BigNumber(sourceSection.sources[0].amount);
  }

  // Find sender from any section with sources
  const sender = sections.find((sec) => sec.sources?.[0]?.owner)?.sources?.[0]
    ?.owner;

  return amount ? { amount, sender, receiver } : undefined;
};

export const TransactionCard = ({
  tx: transactionTopLevel,
}: Props): JSX.Element => {
  const transaction = transactionTopLevel.tx;
  const nativeToken = useAtomValue(nativeTokenAddressAtom).data;
  const token = getToken(transaction, nativeToken ?? "");
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);
  const asset = token ? chainAssetsMap[token] : undefined;
  const isBondingTransaction = transactionTopLevel?.tx?.kind === "bond";
  const txnInfo =
    isBondingTransaction ?
      getBondTransactionInfo(transaction)
    : getTransactionInfo(transaction);
  const baseAmount =
    asset && txnInfo?.amount ?
      toDisplayAmount(asset, txnInfo.amount)
    : undefined;
  const receiver = txnInfo?.receiver;
  const sender = txnInfo?.sender;
  const isReceived = transactionTopLevel?.kind === "received";
  const isInternalUnshield =
    transactionTopLevel?.kind === "received" && isMaspAddress(sender ?? "");
  const transactionFailed = transaction?.exitCode === "rejected";
  const validators = useAtomValue(allValidatorsAtom);
  const validator = validators?.data?.find((v) => v.address === receiver);

  const renderKeplrIcon = (address: string): JSX.Element | null => {
    if (isShieldedAddress(address)) return null;
    if (isTransparentAddress(address)) return null;
    return <img src={keplrSvg} height={18} width={18} />;
  };

  const getTitle = (tx: Tx["tx"]): string => {
    const kind = tx?.kind;

    if (!kind) return "Unknown";
    if (isInternalUnshield) return "Unshielding Transfer";
    if (isReceived) return "Receive";
    if (kind.startsWith("ibc")) return "IBC Transfer";
    if (kind === "bond") return "Stake";
    if (kind === "claimRewards") return "Claim Rewards";
    if (kind === "transparentTransfer") return "Transparent Transfer";
    if (kind === "shieldingTransfer") return "Shielding Transfer";
    if (kind === "unshieldingTransfer") return "Unshielding Transfer";
    if (kind === "shieldedTransfer") return "Shielded Transfer";
    return "Transfer";
  };

  return (
    <article
      className={twMerge(
        clsx(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center my-1 font-semibold",
          "gap-5 bg-neutral-800 rounded-sm px-5 text-white border border-transparent",
          "transition-colors duration-200 hover:border-neutral-500",
          isBondingTransaction && validator?.imageUrl ? "py-3" : "py-5"
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
          {!transactionFailed && (
            <IoCheckmarkCircleOutline className="ml-1 mt-0.5 w-10 h-10" />
          )}
          {transactionFailed && (
            <IoCloseCircleOutline className="ml-1 mt-0.5 w-10 h-10" />
          )}
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
            {transactionFailed && "Failed"} {getTitle(transaction)}{" "}
            <div className="relative group/tooltip">
              <CopyToClipboardControl
                className="ml-1.5 text-neutral-400"
                value={transaction?.txId ?? ""}
              />
              <Tooltip position="right" className="p-2 -mr-3 w-[150px] z-10">
                Copy transaction hash
              </Tooltip>
            </div>
          </h3>
          <h3 className="text-neutral-400">
            {transactionTopLevel?.timestamp ?
              new Date(transactionTopLevel.timestamp * 1000)
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
        <div className="aspect-square w-10 h-10 mt-1">
          <AssetImage asset={asset} />
        </div>
        <TokenCurrency
          className="font-semibold text-white mt-1 ml-2"
          amount={baseAmount ?? BigNumber(0)}
          symbol={asset?.symbol ?? ""}
        />
      </div>

      {!isBondingTransaction && (
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
      )}

      <div className="flex flex-col">
        <h4 className={isShieldedAddress(receiver ?? "") ? "text-yellow" : ""}>
          {isBondingTransaction ? "Validator" : "To"}
        </h4>
        <h4 className={isShieldedAddress(receiver ?? "") ? "text-yellow" : ""}>
          {isShieldedAddress(receiver ?? "") ?
            <span className="flex items-center gap-1">
              <FaLock className="w-4 h-4" /> Shielded
            </span>
          : isBondingTransaction ?
            validator?.imageUrl ?
              <img
                src={validator?.imageUrl}
                className="w-9 h-9 mt-1 rounded-full"
              />
            : shortenAddress(receiver ?? "", 10, 10)
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
