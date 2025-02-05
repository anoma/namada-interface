import BigNumber from "bignumber.js";
import { TokenCurrency } from "./TokenCurrency";

type TransactionFeeProps = {
  displayAmount: BigNumber;
  symbol: string;
};

export const TransactionFee = ({
  displayAmount,
  symbol,
}: TransactionFeeProps): JSX.Element => {
  return (
    <div className="text-sm">
      Transaction fee:{" "}
      <TokenCurrency
        symbol={symbol}
        amount={displayAmount}
        className="font-medium"
      />
    </div>
  );
};
