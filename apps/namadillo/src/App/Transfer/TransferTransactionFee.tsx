import { TokenCurrency } from "App/Common/TokenCurrency";
import { toDisplayAmount } from "utils";
import { TransactionFee } from "./TransferModule";
import ibcTransferImage from "./assets/ibc-transfer.png";

type TransferTransactionFeeProps = {
  transactionFee: TransactionFee;
  isIbcTransfer?: boolean;
};

export const TransferTransactionFee = ({
  isIbcTransfer,
  transactionFee,
}: TransferTransactionFeeProps): JSX.Element => {
  return (
    <footer className="flex justify-between items-center mt-12 text-sm">
      <span className="underline">Transaction Fee</span>
      {isIbcTransfer && (
        <span className="w-20">
          <img src={ibcTransferImage} />
        </span>
      )}
      <TokenCurrency
        amount={toDisplayAmount(transactionFee.token, transactionFee.amount)}
        asset={transactionFee.token}
      />
    </footer>
  );
};
