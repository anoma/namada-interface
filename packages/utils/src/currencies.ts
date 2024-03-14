export type CurrencyInfo = {
  sign: string;
  singular: string;
  plural: string;
  fraction: string;
  fiat: boolean;
};

export type CurrencyInfoListItem = {
  id: string;
} & CurrencyInfo;

export const KnownCurrencies: Record<string, CurrencyInfo> = {
  usd: {
    sign: "$",
    singular: "US Dollar",
    plural: "US Dollars",
    fraction: "cents",
    fiat: true,
  },
  eur: {
    sign: "€",
    singular: "Euro",
    plural: "Euros",
    fraction: "cents",
    fiat: true,
  },
  nam: {
    sign: "NAM",
    singular: "NAM",
    plural: "NAMs",
    fraction: "cents",
    fiat: false,
  },
  jpy: {
    sign: "¥",
    singular: "Yen",
    plural: "Yens",
    fraction: "cents",
    fiat: true,
  },
};

export const CurrencyList: CurrencyInfoListItem[] = Object.keys(
  KnownCurrencies
).map((currency) => ({
  id: currency,
  ...KnownCurrencies[currency],
}));

export const FiatCurrencyList = CurrencyList.filter(
  (currency) => currency.fiat
);

export type CurrencyType = keyof typeof KnownCurrencies;
