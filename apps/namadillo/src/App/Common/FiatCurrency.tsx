import { Currency, CurrencyProps } from "@namada/components";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { selectedCurrencyRateAtom } from "slices/exchangeRates";
import { hideBalancesAtom, selectedCurrencyAtom } from "slices/settings";

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
