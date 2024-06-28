import { CurrencyType } from "@namada/utils";
import { atom } from "jotai";
import { selectedCurrencyAtom } from "./settings";

type SupportedCurrencies = "nam";

export type ExchangeRateTable = Record<
  SupportedCurrencies,
  Record<CurrencyType, number>
>;

export const exchangeRateAtom = atom<ExchangeRateTable>({
  nam: {
    usd: 0,
    eur: 0,
    jpy: 0,
  },
});

export const selectedCurrencyRateAtom = atom((get) => {
  const exchangeRates = get(exchangeRateAtom);
  const activeCurrency = get(selectedCurrencyAtom);
  return exchangeRates["nam"][activeCurrency];
});
