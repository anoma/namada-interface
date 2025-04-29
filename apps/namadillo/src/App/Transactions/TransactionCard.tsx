import { TransactionHistory as TransactionHistoryType } from "@namada/indexer-client";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { routes } from "App/routes";
import { chainAssetsMapAtom } from "atoms/chain";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { GoIssueClosed, GoXCircle } from "react-icons/go";
import { ImCheckmark } from "react-icons/im";
import { generatePath, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { toDisplayAmount } from "utils";

type Tx = TransactionHistoryType;
type Props = { tx: Tx };

const IBC_PREFIX = "ibc";

const isIBCTransaction = (kind: string | undefined): boolean => {
  if (!kind) return false;
  return kind.startsWith("ibc");
};

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
  if (isReceived) return "Received";
  if (kind.startsWith(IBC_PREFIX)) return "Transfer IBC";
  if (kind === "transparenttransfer") return "Transparent Transfer";
  if (kind === "shieldingtransfer" || kind === "unshieldingtransfer")
    return "Shielding Transfer";
  if (kind === "shieldedtransfer") return "Shielded Transfer";
  return "Transfer";
};

type RawDataSection = {
  amount?: string;
  sources?: Array<{ amount: string; owner: string }>;
  targets?: Array<{ amount: string; owner: string }>;
};

export function getTransactionInfo(
  tx: Tx["tx"]
): { amount: BigNumber; receiver: string } | undefined {
  let parsed: RawDataSection | RawDataSection[];
  if (typeof tx?.data === "string") {
    parsed = JSON.parse(tx.data);
  } else if (tx?.data) {
    parsed = tx.data;
  } else {
    return undefined;
  }

  const sections = Array.isArray(parsed) ? parsed : [parsed];
  if (sections.length === 0) return undefined;

  for (const sec of sections) {
    // Try targets first (i.e. true transfers)
    if (sec.targets?.length && sec.targets[0].amount && sec.targets[0].owner) {
      return {
        amount: new BigNumber(sec.targets[0].amount),
        receiver: sec.targets[0].owner,
      };
    }
    // Fallback to sources
    if (sec.sources?.length && sec.sources[0].amount && sec.sources[0].owner) {
      return {
        amount: new BigNumber(sec.sources[0].amount),
        receiver: sec.sources[0].owner,
      };
    }
  }

  return undefined;
}

export const TransactionCard = ({ tx }: Props): JSX.Element => {
  const navigate = useNavigate();
  const transactionTopLevel = tx;
  const transaction = transactionTopLevel.tx;
  const isReceived = transactionTopLevel?.kind === "received";
  const token = getToken(transaction);
  const isIbc = isIBCTransaction(transaction?.kind);
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);
  const asset = token ? chainAssetsMap[token] : undefined;
  const txnInfo = getTransactionInfo(transaction);
  const baseAmount =
    asset && txnInfo?.amount ?
      toDisplayAmount(asset, txnInfo.amount)
    : undefined;
  const receiver = txnInfo?.receiver;

  return (
    <article
      className={twMerge(
        clsx(
          "grid grid-cols-[min-content_auto_min-content] items-center cursor-pointer my-1",
          "gap-5 bg-neutral-800 rounded-sm px-5 py-5 text-white border border-transparent",
          "transition-colors duration-200 hover:border-neutral-500"
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
        {transaction?.exitCode === "rejected" && <GoXCircle />}
      </i>

      <div>
        <h3>{titleFor(transaction?.kind, isReceived)}</h3>
        <p className="text-sm text-neutral-400">
          <TokenCurrency
            className="text-white"
            amount={baseAmount ?? BigNumber(0)}
            symbol={asset?.symbol ?? ""}
          />{" "}
          to {receiver}
        </p>
      </div>

      <i className="text-white text-xl">
        {transaction?.exitCode === "applied" && <ImCheckmark />}
        {transaction?.exitCode === "rejected" && <GoXCircle />}
      </i>
    </article>
  );
};
