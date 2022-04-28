import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const SETTINGS_ACTIONS_BASE = "settings";

export type SettingsState = {
  fiatCurrency: string;
  network: string;
  selectedAccountID: string;
};

const initialState: SettingsState = {
  fiatCurrency: "USD",
  network: "default",
  selectedAccountID: "",
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
    setAccountID: (state, action: PayloadAction<string>) => {
      state.selectedAccountID = action.payload;
    },
  },
});

const { actions, reducer } = settingsSlice;

export const { setFiatCurrency, setNetwork, setAccountID } = actions;

export default reducer;
