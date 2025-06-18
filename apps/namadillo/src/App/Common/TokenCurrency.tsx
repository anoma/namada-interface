import { Currency, CurrencyProps } from "@namada/components";

type TokenCurrencyProps = Omit<
  CurrencyProps,
  "currency" | "currencyPosition" | "spaceAroundSign"
> & { symbol: string };

export const TokenCurrency = ({
  symbol,
  ...props
}: TokenCurrencyProps): JSX.Element => {
  return (
    <Currency
      currency={{
        symbol,
      }}
      currencyPosition="right"
      spaceAroundSymbol={true}
      {...props}
    />
  );
};
