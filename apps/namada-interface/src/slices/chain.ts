import { chains } from "@namada/chains";
import { Chain } from "@namada/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type ChainState = {
  config: Chain;
};

const initialState: ChainState = { config: chains.namada };

const CHAIN_ACTIONS_BASE = "chain";
const chainSlice = createSlice({
  name: CHAIN_ACTIONS_BASE,
  initialState,
  reducers: {
    setChain: (state, action: PayloadAction<Chain>) => {
      const chain = action.payload;
      state.config = chain;
    },
  },
});

const { actions, reducer } = chainSlice;
export const { setChain } = actions;

export default reducer;
