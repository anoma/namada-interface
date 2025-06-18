import { Currency, CurrencyProps } from "@namada/components";
import BigNumber from "bignumber.js";

type TokenCurrencyProps = Omit<
  CurrencyProps,
  "currency" | "currencyPosition" | "spaceAroundSign"
> & { symbol: string };

export const TokenCurrency = ({
  symbol,
  amount,
  ...props
}: TokenCurrencyProps): JSX.Element => {
  // Fix for historical NAM amounts that might be in micro units
  // If symbol is NAM and amount >= 1,000,000, assume it's in micro units and convert to whole units
  let adjustedAmount = amount;
  if (
    symbol === "NAM" &&
    amount &&
    BigNumber.isBigNumber(amount) &&
    amount.gte(1_000_000)
  ) {
    adjustedAmount = amount.dividedBy(1_000_000);
  }

  return (
    <Currency
      currency={{
        symbol,
      }}
      currencyPosition="right"
      spaceAroundSymbol={true}
      amount={adjustedAmount}
      {...props}
    />
  );
};
