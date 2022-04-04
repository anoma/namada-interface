import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { stringToHash } from "utils/helpers";

type Balance = {
  token: number;
  usd: number;
};

type AccountBalances = {
  [hash: string]: Balance;
};

export type BalancesState = {
  accountBalances: AccountBalances;
};

const initialState: BalancesState = {
  accountBalances: {},
};

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
      state.accountBalances[hash] = {
        token,
        usd,
      };
    },
  },
});

const { actions, reducer } = balancesSlice;
export const { setBalance } = actions;
export default reducer;
