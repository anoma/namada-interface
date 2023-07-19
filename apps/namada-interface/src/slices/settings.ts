import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultChainId } from "@namada/chains";

const SETTINGS_ACTIONS_BASE = "settings";

export type SettingsState = {
  fiatCurrency: string;
  chainId: string;
  connectedChains: string[];
};

const initialState: SettingsState = {
  fiatCurrency: "USD",
  chainId: defaultChainId,
  connectedChains: [],
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
    setIsConnected: (state, action: PayloadAction<string>) => {
      state.connectedChains = state.connectedChains.includes(action.payload)
        ? state.connectedChains
        : [...state.connectedChains, action.payload];
    },
  },
});

const { actions, reducer } = settingsSlice;

export const { setFiatCurrency, setChainId, setIsConnected } = actions;

export default reducer;
