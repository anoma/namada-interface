import { Chain } from "@chain-registry/types";
import { CopyToClipboardControl, Stack } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import {
  isNamadaAddress,
  isShieldedAddress,
  parseChainInfo,
} from "App/Transfer/common";
import { SelectedChain } from "App/Transfer/SelectedChain";
import { SelectedWallet } from "App/Transfer/SelectedWallet";
import { TokenAmountCard } from "App/Transfer/TokenAmountCard";
import { TransferArrow } from "App/Transfer/TransferArrow";
import { findChainById } from "atoms/integrations";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { wallets } from "integrations";
import { useMemo } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { GoHourglass, GoXCircle } from "react-icons/go";
import {
  allTransferTypes,
  PartialTransferTransactionData,
  TransferStep,
} from "types";

type TransactionReceiptProps = {
  transaction: PartialTransferTransactionData;
};

const stepDescription: Record<TransferStep, string> = {
  sign: "Signature required",
  "ibc-to-shielded": "IBC Transfer to Namada MASP",
  "zk-proof": "Generating ZK Proof",
  "ibc-to-transparent": "IBC Transfer to Namada",
  "shielded-to-shielded": "Transfer to Namada Shielded",
  "transparent-to-shielded": "Transfer to Namada Shielded",
  "transparent-to-transparent": "Transfer to Namada Transparent",
  "shielded-to-transparent": "Transfer to Namada Transparent",
  "ibc-withdraw": "Transfer from Namada",
  "waiting-confirmation": "Waiting for confirmation",
  complete: "Transfer Complete",
};

const TransferTransactionReceipt = ({
  transaction,
}: TransactionReceiptProps): JSX.Element => {
  const getChain = (chainId: string, address: string): Chain | undefined => {
    const chain = findChainById(chainId);
    if (isNamadaAddress(address) && chain) {
      return parseChainInfo(chain, isShieldedAddress(address || ""));
    }
    return chain;
  };

  const sourceChain = useMemo(() => {
    return getChain(transaction.chainId, transaction.sourceAddress || "");
  }, [transaction]);

  const destinationChain = useMemo(() => {
    return getChain(
      "destinationChainId" in transaction ?
        transaction.destinationChainId || ""
      : transaction.chainId,
      transaction.destinationAddress || ""
    );
  }, [transaction]);

  const sourceWallet =
    isNamadaAddress(transaction.sourceAddress || "") ?
      wallets.namada
    : wallets.keplr;

  const destinationWallet =
    isNamadaAddress(transaction.destinationAddress || "") ?
      wallets.namada
    : wallets.keplr;

  return (
    <Stack className="max-w-[440px] mx-auto">
      <div className="rounded-md bg-neutral-800 px-4 pb-6">
        <header className="relative flex justify-between">
          {sourceChain && (
            <SelectedChain
              chain={sourceChain}
              wallet={sourceChain ? sourceWallet : undefined}
            />
          )}
          {sourceWallet && (
            <SelectedWallet
              wallet={sourceWallet}
              address={transaction.sourceAddress}
            />
          )}
        </header>
        <hr className="mt-4 mb-2.5 mx-2 border-white opacity-[5%]" />
        <TokenAmountCard
          asset={transaction.asset}
          displayAmount={transaction.displayAmount || new BigNumber(0)}
        />
      </div>
      <i className="flex items-center justify-center w-11 mx-auto -my-8 relative z-10">
        <TransferArrow color={transaction.shielded ? "#FF0" : "#FFF"} />
      </i>
      <div
        className={clsx(
          "rounded-md bg-neutral-800 px-4 pt-6 pb-5 border",
          transaction.shielded ? "border-yellow" : "border-white"
        )}
      >
        <TokenAmountCard
          asset={transaction.asset}
          displayAmount={transaction.displayAmount || new BigNumber(0)}
        />
        <footer>
          <hr className="mt-4 mb-2.5 mx-2 border-white opacity-[5%]" />
          <div className="flex justify-between items-center">
            {destinationChain && (
              <SelectedChain
                chain={destinationChain}
                wallet={sourceWallet}
                iconSize="36px"
              />
            )}
            {destinationWallet && (
              <SelectedWallet
                wallet={destinationWallet}
                address={transaction.destinationAddress}
              />
            )}
          </div>
        </footer>
      </div>
    </Stack>
  );
};

const ibcTransparentTransfer = {
  tx: {
    txId: "20979de7445767359b91ce609dae3ea45e94f34aaca30ab03fbb1382c0bd6802",
    wrapperId:
      "7cf3bf2e0078056bc97fdbb3922603e65be9fb5da61fdf9ef642f404ea21a6f7",
    kind: "ibcTransparentTransfer",
    data: '[{"Ibc":{"address":{"Account":"tnam1p5z8ruwyu7ha8urhq2l0dhpk2f5dv3ts7uyf2n75"},"trace":{"IbcTrace":"transfer/channel-1/uosmo"}}},{"sources":[{"owner":"tnam1qcqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqvtr7x4","token":"tnam1p5z8ruwyu7ha8urhq2l0dhpk2f5dv3ts7uyf2n75","amount":"1000000"}],"targets":[{"amount":"1000000","token":"tnam1p5z8ruwyu7ha8urhq2l0dhpk2f5dv3ts7uyf2n75","owner":"tnam1qzuq58crq9sv35fa79u7a82fy99plk3gpve30cxs"}],"shielded_section_hash":null}]',
    memo: "52656c6179656420627920616e6f64656f667a656e21",
    exitCode: "applied",
  },
  target: "tnam1qzuq58crq9sv35fa79u7a82fy99plk3gpve30cxs",
  kind: "received",
  blockHeight: 1209630,
};

const sent = {
  tx: {
    txId: "2b2dd22a6dcd6541bf4ab8f8e36761e507da577ddf9ab070dbaa441bdc8db26a",
    wrapperId:
      "f527e7eeaa768d6bb9654d002059aad9cdbc9f053b6b4273695e4590bf5941ca",
    kind: "shieldingTransfer",
    data: '{"sources":[{"amount":"4180900","token":"tnam1p5z8ruwyu7ha8urhq2l0dhpk2f5dv3ts7uyf2n75","owner":"tnam1qzuq58crq9sv35fa79u7a82fy99plk3gpve30cxs"}],"targets":[{"owner":"tnam1pcqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzmefah","token":"tnam1p5z8ruwyu7ha8urhq2l0dhpk2f5dv3ts7uyf2n75","amount":"4180900"}],"shielded_section_hash":[186,197,223,158,116,227,210,39,36,13,236,55,84,160,48,140,12,221,65,228,44,15,240,155,183,234,68,65,214,18,248,56]}',
    memo: null,
    exitCode: "applied",
  },
  target: "tnam1qzuq58crq9sv35fa79u7a82fy99plk3gpve30cxs",
  kind: "sent",
  blockHeight: 1672972,
};

const receieved = {
  tx: {
    txId: "c0c9d0815d3c0f6611b7b7f65595f5550bb9ea61cd563ade9776a7f25f5d9c28",
    wrapperId:
      "ccc28eea4dcc502fc3429dc7054562bfeb4ea0dd771a74d32b89c23625ff9741",
    kind: "ibcTransparentTransfer",
    data: '[{"Ibc":{"address":{"Account":"tnam1p5z8ruwyu7ha8urhq2l0dhpk2f5dv3ts7uyf2n75"},"trace":{"IbcTrace":"transfer/channel-1/uosmo"}}},{"sources":[{"owner":"tnam1qcqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqvtr7x4","token":"tnam1p5z8ruwyu7ha8urhq2l0dhpk2f5dv3ts7uyf2n75","amount":"1000"}],"targets":[{"token":"tnam1p5z8ruwyu7ha8urhq2l0dhpk2f5dv3ts7uyf2n75","owner":"tnam1qzuq58crq9sv35fa79u7a82fy99plk3gpve30cxs","amount":"1000"}],"shielded_section_hash":null}]',
    memo: "2b2052656c6179656420627920436f736d69632056616c696461746f72",
    exitCode: "applied",
  },
  target: "tnam1qzuq58crq9sv35fa79u7a82fy99plk3gpve30cxs",
  kind: "received",
  blockHeight: 1209608,
};

export const TransactionReceipt = ({
  transaction,
}: TransactionReceiptProps): JSX.Element => {
  const isTransferTransaction = (): boolean => {
    return allTransferTypes.includes(transaction.type);
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex justify-center my-3 text-5xl">
          {transaction.status === "error" && (
            <span className="text-fail">{<GoXCircle />}</span>
          )}
          {transaction.status === "success" && (
            <span className="text-success">{<FaCheckCircle />}</span>
          )}
          {transaction.status === "pending" && (
            <span className="text-neutral-600">{<GoHourglass />}</span>
          )}
        </div>
        <h2
          className={clsx("text-center text-xl", {
            "text-success": transaction.status === "success",
            "text-fail": transaction.status === "error",
          })}
        >
          {transaction.status === "error" ?
            "Transaction Failed"
          : stepDescription[transaction.currentStep || "sign"]}
        </h2>
        {transaction.errorMessage && (
          <div className="text-center text-red-900 text-sm mb-3">
            {transaction.errorMessage}
          </div>
        )}
        {transaction.hash && (
          <span className="my-1 text-sm text-center block text-neutral-600">
            Transaction hash:{" "}
            <span className="inline-flex gap-1">
              {shortenAddress(transaction.hash, 8, 8)}
              <CopyToClipboardControl value={transaction.hash} />
            </span>
          </span>
        )}
      </header>
      <article>
        {isTransferTransaction() ?
          <TransferTransactionReceipt transaction={transaction} />
        : <div></div>}
      </article>
    </div>
  );
};
