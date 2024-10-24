import { Currency, CurrencyProps } from "@namada/components";

type FiatCurrencyProps = Omit<CurrencyProps, "currency">;

export const FiatCurrency = (props: FiatCurrencyProps): JSX.Element => {
  return <Currency currency={{ symbol: "$", fraction: "cents" }} {...props} />;
};
