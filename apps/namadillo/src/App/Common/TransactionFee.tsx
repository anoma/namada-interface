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
    <div className="flex items-center gap-2">
      <span className="text-xs leading-none text-neutral-500">Fee:</span>
      <TokenCurrency
        symbol={symbol}
        amount={displayAmount}
        className="text-sm font-medium"
      />
    </div>
  );
};
