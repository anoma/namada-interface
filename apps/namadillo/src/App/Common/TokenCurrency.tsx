import { Asset } from "@chain-registry/types";
import { Currency, CurrencyProps } from "@namada/components";

type TokenCurrencyProps = Omit<
  CurrencyProps,
  "currency" | "currencyPosition" | "spaceAroundSign"
> & { asset: Asset };

export const TokenCurrency = ({
  asset,
  ...props
}: TokenCurrencyProps): JSX.Element => {
  return (
    <Currency
      currency={{
        symbol: asset.symbol,
      }}
      currencyPosition="right"
      spaceAroundSymbol={true}
      {...props}
    />
  );
};
