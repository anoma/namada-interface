import { atom } from "jotai";

type TokenId = string;
type FiatExchangeRate = Record<string, number>;
type ExchangeRates = Record<TokenId, FiatExchangeRate>;

export const exchangeRateAtom = (() => {
  const base = atom<ExchangeRates>({});

  // TODO: Retrieve actual data
  return atom(
    (get) => get(base),
    async (_get, set) => {
      set(base, {
        NAM: {
          USD: 0,
          EUR: 0,
          YPN: 0,
        },
      });
    }
  );
})();
