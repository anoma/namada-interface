import { ChainKey } from "@namada/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const SETTINGS_ACTIONS_BASE = "settings";

export type SettingsState = {
  connectedChains: string[];
};

const initialState: SettingsState = {
  connectedChains: [],
};

const settingsSlice = createSlice({
  name: SETTINGS_ACTIONS_BASE,
  initialState,
  reducers: {
    setIsConnected: (state, action: PayloadAction<ChainKey>) => {
      state.connectedChains = state.connectedChains.includes(action.payload)
        ? state.connectedChains
        : [...state.connectedChains, action.payload];
    },
  },
});

const { actions, reducer } = settingsSlice;

export const { setIsConnected } = actions;

export default reducer;
