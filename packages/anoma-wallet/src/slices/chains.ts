import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Config, { Chain } from "config";

const CHAINS_ACTIONS_BASE = "channels";
export type ChainsState = Record<string, Chain>;

const initialState: ChainsState = Config.chain;

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
