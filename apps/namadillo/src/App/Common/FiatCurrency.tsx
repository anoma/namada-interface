import { Currency, CurrencyProps } from "@namada/components";
import BigNumber from "bignumber.js";

type FiatCurrencyProps = Omit<CurrencyProps, "currency">;

export const FiatCurrency = (props: FiatCurrencyProps): JSX.Element => {
  const formattedAmount = new BigNumber(props.amount.toPrecision(2));
  return (
    <Currency
      {...props}
      currency={{ symbol: "$", fraction: "cents" }}
      amount={formattedAmount}
    />
  );
};
