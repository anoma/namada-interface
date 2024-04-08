export type Currency = {
  symbol: string;
  currency: string;
  label: string;
};

export const Currencies: Currency[] = [
  {
    symbol: "$",
    currency: "USD",
    label: "US Dollar",
  },
  {
    symbol: "€",
    currency: "EUR",
    label: "Euro",
  },
  {
    symbol: "¥",
    currency: "JPY",
    label: "Japanese Yen",
  },
];
