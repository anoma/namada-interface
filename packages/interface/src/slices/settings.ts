import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { defaultChainId } from "config/chain";

const SETTINGS_ACTIONS_BASE = "settings";

export type SettingsState = {
  fiatCurrency: string;
  chainId: string;
};

const initialState: SettingsState = {
  fiatCurrency: "USD",
  chainId: defaultChainId,
};

const settingsSlice = createSlice({
  name: SETTINGS_ACTIONS_BASE,
  initialState,
  reducers: {
    setFiatCurrency: (state, action: PayloadAction<string>) => {
      state.fiatCurrency = action.payload;
    },
    setChainId: (state, action: PayloadAction<string>) => {
      state.chainId = action.payload;
    },
  },
});

const { actions, reducer } = settingsSlice;

export const { setFiatCurrency, setChainId } = actions;

export default reducer;
