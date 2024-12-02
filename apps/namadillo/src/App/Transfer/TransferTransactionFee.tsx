import { TokenCurrency } from "App/Common/TokenCurrency";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { TransactionFee } from "./TransferModule";
import ibcTransferImageBlack from "./assets/ibc-transfer-black.png";
import ibcTransferImageWhite from "./assets/ibc-transfer-white.png";

type TransferTransactionFeeProps = {
  transactionFee: TransactionFee;
  isIbcTransfer?: boolean;
  textColor?: "white" | "black";
};

export const TransferTransactionFee = ({
  isIbcTransfer,
  transactionFee,
  textColor = "white",
}: TransferTransactionFeeProps): JSX.Element => {
  return (
    <footer
      className={twMerge(
        clsx("flex justify-between items-center mt-12 text-sm", {
          "text-white": textColor === "white",
          "text-black": textColor === "black",
        })
      )}
    >
      <span className="underline">Transaction Fee</span>
      {isIbcTransfer && (
        <span className="w-20">
          {textColor === "white" && <img src={ibcTransferImageWhite} />}
          {textColor === "black" && <img src={ibcTransferImageBlack} />}
        </span>
      )}
      <TokenCurrency
        amount={(transactionFee.asset, transactionFee.amount)}
        symbol={transactionFee.asset.symbol}
      />
    </footer>
  );
};
