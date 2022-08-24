export { type TokenType, Tokens, Symbols } from "./tokens";
export { TxResponse } from "./tx";
export { TxWasm, VpWasm } from "./wasm";

export type Currency = {
  currency: string;
  label: string;
};

export const Currencies: Currency[] = [
  {
    currency: "USD",
    label: "US Dollar",
  },
  {
    currency: "EUR",
    label: "Euro",
  },
  {
    currency: "JPY",
    label: "Japanese Yen",
  },
];
