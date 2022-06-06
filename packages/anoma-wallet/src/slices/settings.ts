import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultChainId } from "config/chain";

const SETTINGS_ACTIONS_BASE = "settings";

export type SettingsState = {
  fiatCurrency: string;
  network: string;
  activeChainId: string;
};

const initialState: SettingsState = {
  fiatCurrency: "USD",
  network: "default",
  activeChainId: defaultChainId,
};

const settingsSlice = createSlice({
  name: SETTINGS_ACTIONS_BASE,
  initialState,
  reducers: {
    setFiatCurrency: (state, action: PayloadAction<string>) => {
      state.fiatCurrency = action.payload;
    },
    setNetwork: (state, action: PayloadAction<string>) => {
      state.network = action.payload;
    },
  },
});

const { actions, reducer } = settingsSlice;

export const { setFiatCurrency, setNetwork } = actions;

export default reducer;
