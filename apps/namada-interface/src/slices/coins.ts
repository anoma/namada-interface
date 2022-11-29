import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Symbols, Tokens } from "@anoma/types";
import { getTimeStamp } from "@anoma/utils";

import Config from "config";
import { Currencies } from "currencies";

const COINS_ACTIONS_BASE = "coins";

export type ConversionRate = {
  currency: string;
  rate: number;
};

export type CoinGeckoIds = Record<string, { coinGeckoId: string }>;

export type RateByToken = Record<string, ConversionRate>;
export type CoinsState = {
  rates: Record<string, RateByToken>;
  timestamp?: number;
};

const initialState: CoinsState = {
  rates: {},
};

type RatesResponse = {
  data: {
    [token: string]: {
      [currency: string]: number;
    };
  };
  timestamp: number;
};

enum CoinsThunkActions {
  FetchRates = "fetchRates",
}

export const fetchConversionRates = createAsyncThunk(
  `${COINS_ACTIONS_BASE}/${CoinsThunkActions.FetchRates}`,
  async (): Promise<RatesResponse> => {
    const { api } = Config;
    const apiBase = api.url;
    const apiKey = api.key;

    const baseUrl = `${apiBase}/simple/price/`;

    const coinsQuery = Symbols.filter((symbol) => Tokens[symbol]?.coinGeckoId)
      .map((symbol) => {
        const token = Tokens[symbol];
        const { coinGeckoId } = token;
        return coinGeckoId;
      })
      .join(",");
    const currenciesQuery = Currencies.map(
      (currency) => currency.currency
    ).join(",");

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

    const json = await response.json();
    const data = json;

    return {
      data,
      timestamp: getTimeStamp(),
    };
  }
);

const coinsSlice = createSlice({
  name: COINS_ACTIONS_BASE,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      fetchConversionRates.fulfilled,
      (state, action: PayloadAction<RatesResponse>) => {
        const { data, timestamp } = action.payload;
        const keys = Object.keys(data);
        state.rates = {};
        state.timestamp = timestamp;

        keys.forEach((key) => {
          const token = Object.values(Tokens).find(
            (token) => token?.coinGeckoId === key
          );
          const symbol = token?.symbol;

          if (symbol) {
            if (!state.rates[symbol]) {
              state.rates[symbol] = {};
            }
            const currencies = Object.keys(data[key]);

            currencies.forEach((currencyKey) => {
              const currency = currencyKey.toUpperCase();
              const rate = data[key][currencyKey] || 1;

              state.rates[symbol][currency] = {
                currency,
                rate,
              };
            });
          }
        });
      }
    );
  },
});

const { reducer } = coinsSlice;

export default reducer;
