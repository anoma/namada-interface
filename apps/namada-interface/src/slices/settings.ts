import { ChainKey } from "@namada/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { reduxStoreAtom } from "store";

import { atom } from "jotai";

const SETTINGS_ACTIONS_BASE = "settings";

export type SettingsState = {
  fiatCurrency: string;
  connectedChains: string[];
};

const initialState: SettingsState = {
  fiatCurrency: "USD",
  connectedChains: [],
};

const settingsSlice = createSlice({
  name: SETTINGS_ACTIONS_BASE,
  initialState,
  reducers: {
    setFiatCurrency: (state, action: PayloadAction<string>) => {
      state.fiatCurrency = action.payload;
    },
    setIsConnected: (state, action: PayloadAction<ChainKey>) => {
      state.connectedChains = state.connectedChains.includes(action.payload)
        ? state.connectedChains
        : [...state.connectedChains, action.payload];
    },
  },
});

const { actions, reducer } = settingsSlice;

export const { setFiatCurrency, setIsConnected } = actions;

export default reducer;

const fiatCurrencyAtom = atom(
  (get) => get(reduxStoreAtom).settings.fiatCurrency
);

export { fiatCurrencyAtom };
