import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { stringToHash } from "utils/helpers";

type Balance = {
  token: number;
  usd: number;
};

export type BalancesState = {
  [hash: string]: Balance;
};

const initialState: BalancesState = {};

const balancesSlice = createSlice({
  name: "balances",
  initialState,
  reducers: {
    setBalance: (
      state,
      action: PayloadAction<{
        alias: string;
        token: number;
        usd: number;
      }>
    ) => {
      const { alias, token, usd } = action.payload;
      const hash = stringToHash(alias);
      state[hash] = {
        token,
        usd,
      };
    },
  },
});

const { actions, reducer } = balancesSlice;
export const { setBalance } = actions;
export default reducer;
