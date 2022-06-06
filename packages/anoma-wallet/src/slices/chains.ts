import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import ChainConfig, { Chain, defaultChainId } from "config/chain";

const CHAINS_ACTIONS_BASE = "channels";
export type ChainsState = Record<string, Chain>;

const chainsConfig = ChainConfig[defaultChainId];

const initialState: ChainsState = {
  [defaultChainId]: chainsConfig,
};
const chainsSlice = createSlice({
  name: CHAINS_ACTIONS_BASE,
  initialState,
  reducers: {
    addChain: (state, action: PayloadAction<Chain>) => {
      const { id } = action.payload;
      state[id] = action.payload;
    },
  },
});

const { actions, reducer } = chainsSlice;
export const { addChain } = actions;

export default reducer;
