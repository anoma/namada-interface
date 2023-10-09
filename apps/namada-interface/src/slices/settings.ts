import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const SETTINGS_ACTIONS_BASE = "settings";

export type SettingsState = {
  fiatCurrency: string;
  chainId: string;
  connectedChains: string[];
};

const initialState: SettingsState = {
  fiatCurrency: "USD",
  chainId:
    process.env.REACT_APP_NAMADA_CHAIN_ID || "qc-testnet-5.1.025a61165acd05e",
  connectedChains: [],
};

const settingsSlice = createSlice({
  name: SETTINGS_ACTIONS_BASE,
  initialState,
  reducers: {
    setFiatCurrency: (state, action: PayloadAction<string>) => {
      state.fiatCurrency = action.payload;
    },
    setIsConnected: (state, action: PayloadAction<string>) => {
      state.connectedChains = state.connectedChains.includes(action.payload)
        ? state.connectedChains
        : [...state.connectedChains, action.payload];
    },
  },
});

const { actions, reducer } = settingsSlice;

export const { setFiatCurrency, setIsConnected } = actions;

export default reducer;
