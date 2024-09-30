import { Currency, CurrencyProps } from "@namada/components";

type NamCurrencyProps = Omit<
  CurrencyProps,
  "currency" | "currencyPosition" | "spaceAroundSign"
>;

export const NamCurrency = ({ ...props }: NamCurrencyProps): JSX.Element => {
  return (
    <Currency
      currency={{
        symbol: "NAM",
      }}
      currencyPosition="right"
      spaceAroundSymbol={true}
      {...props}
    />
  );
};
