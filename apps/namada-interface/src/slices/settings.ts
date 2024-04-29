import { ChainKey } from "@namada/types";
import { CurrencyType } from "@namada/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { atom } from "jotai";

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
      state.connectedChains =
        state.connectedChains.includes(action.payload) ?
          state.connectedChains
        : [...state.connectedChains, action.payload];
    },
  },
});

const { actions, reducer } = settingsSlice;

export const { setIsConnected } = actions;

export default reducer;

////////////////////////////////////////////////////////////////////////////////
// JOTAI
////////////////////////////////////////////////////////////////////////////////

export const namadaExtensionConnectedAtom = atom(false);
export const selectedCurrencyAtom = atom<CurrencyType>("usd");
export const hideBalancesAtom = atom(false);
export const connectedChainsAtom = atom<ChainKey[]>([]);
export const addConnectedChainAtom = atom(null, (get, set, chain: ChainKey) => {
  const connectedChains = get(connectedChainsAtom);
  set(
    connectedChainsAtom,
    connectedChains.includes(chain) ? connectedChains : (
      [...connectedChains, chain]
    )
  );
});
