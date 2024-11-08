import { Currency, CurrencyProps } from "@namada/components";
import BigNumber from "bignumber.js";

type FiatCurrencyProps = Omit<CurrencyProps, "currency">;

export const FiatCurrency = (props: FiatCurrencyProps): JSX.Element => {
  let amount = new BigNumber(props.amount);
  if (amount.lt(0.01)) {
    amount = new BigNumber(amount.toPrecision(2));
  } else {
    amount = amount.decimalPlaces(2);
  }

  return (
    <Currency
      {...props}
      currency={{ symbol: "$", fraction: "cents" }}
      amount={amount}
      decimalPlaces={amount.decimalPlaces() === 1 ? 2 : undefined}
    />
  );
};
