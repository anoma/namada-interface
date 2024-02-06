import { chains } from "@namada/chains";
import { Chain } from "@namada/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { getIntegration } from "@namada/integrations";
import { atom } from "jotai";

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

////////////////////////////////////////////////////////////////////////////////
// JOTAI
////////////////////////////////////////////////////////////////////////////////

const chainAtom = (() => {
  const base = atom(chains.namada);

  return atom(
    (get) => get(base),
    async (_get, set) => {
      const namada = getIntegration("namada");
      const chain = await namada.getChain();
      if (typeof chain === "undefined") {
        throw new Error("chain was undefined!");
      }
      set(base, chain);
    }
  );
})();

export { chainAtom };
