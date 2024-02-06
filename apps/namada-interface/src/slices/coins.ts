import { Symbols, Tokens } from "@namada/types";
import { getTimeStamp } from "@namada/utils";

import Config from "config";
import { Currencies } from "currencies";

import { Balance } from "slices/accounts";

import BigNumber from "bignumber.js";
import { atom } from "jotai";

export type ConversionRate = {
  currency: string;
  rate: number;
};

export type CoinGeckoIds = Record<string, { coinGeckoId: string }>;

export type RateByToken = Record<string, ConversionRate>;
export type CoinsState = {
  rates: Record<string, RateByToken>;
  timestamp: number;
};

const fetchConversionRates = async (): Promise<CoinsState> => {
  const { api } = Config;
  const apiBase = api.url;
  const apiKey = api.key;

  const baseUrl = `${apiBase}/simple/price`;

  const coinsQuery = Symbols.filter((symbol) => Tokens[symbol]?.coinGeckoId)
    .map((symbol) => {
      const token = Tokens[symbol];
      const { coinGeckoId } = token;
      return coinGeckoId;
    })
    .join(",");
  const currenciesQuery = Currencies.map((currency) => currency.currency).join(
    ","
  );

  const headers = apiKey
    ? {
        "X-Api-Key": apiKey,
      }
    : undefined;

  const url = `${baseUrl}?ids=${coinsQuery}&vs_currencies=${currenciesQuery}`;

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  const data = await response.json();

  const timestamp = getTimeStamp();

  const keys = Object.keys(data);
  const rates = {} as Record<string, RateByToken>;

  keys.forEach((key) => {
    const token = Object.values(Tokens).find(
      (token) => token?.coinGeckoId === key
    );
    const symbol = token?.symbol;

    if (symbol) {
      if (!rates[symbol]) {
        rates[symbol] = {};
      }
      const currencies = Object.keys(data[key]);

      currencies.forEach((currencyKey) => {
        const currency = currencyKey.toUpperCase();
        const rate = data[key][currencyKey] || 1;

        rates[symbol][currency] = {
          currency,
          rate,
        };
      });
    }
  });

  return { rates, timestamp };
};

const coinsAtom = (() => {
  const base = atom(new Promise<CoinsState>(() => {}));

  return atom(
    (get) => get(base),
    (_get, set) => set(base, fetchConversionRates())
  );
})();

const balanceToFiatAtom = atom(async (get) => {
  const { rates } = await get(coinsAtom);

  return (balance: Balance, fiatCurrency: string) => {
    return Object.entries(balance).reduce((acc, [token, value]) => {
      return acc.plus(
        rates[token] && rates[token][fiatCurrency]
          ? value.multipliedBy(rates[token][fiatCurrency].rate)
          : value
      );
    }, new BigNumber(0));
  };
});

export { balanceToFiatAtom, coinsAtom };
