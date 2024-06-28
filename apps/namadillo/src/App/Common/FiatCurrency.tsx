import { Currency, CurrencyProps } from "@namada/components";
import { selectedCurrencyRateAtom } from "atoms/exchangeRates";
import { hideBalancesAtom, selectedCurrencyAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";

type FiatCurrencyProps = {
  amountInNam: BigNumber;
} & Omit<
  CurrencyProps,
  "amount" | "currency" | "currencyPosition" | "spaceAroundSign"
>;

export const FiatCurrency = ({
  amountInNam,
  ...props
}: FiatCurrencyProps): JSX.Element => {
  const hideBalances = useAtomValue(hideBalancesAtom);
  const selectedFiatCurrency = useAtomValue(selectedCurrencyAtom);
  const selectedCurrencyRate = useAtomValue(selectedCurrencyRateAtom);
  return (
    <Currency
      currency={selectedFiatCurrency}
      amount={amountInNam.multipliedBy(selectedCurrencyRate)}
      hideBalances={hideBalances}
      {...props}
    />
  );
};
