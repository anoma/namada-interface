import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account } from "@anoma/types";

type Accounts = {
  [address: string]: Account;
};

type ChainId = string;

export type AccountsState = {
  derived: Record<ChainId, Accounts>;
};

const ACCOUNTS_ACTIONS_BASE = "accounts";

const initialState: AccountsState = {
  derived: {},
};

const accountsSlice = createSlice({
  name: ACCOUNTS_ACTIONS_BASE,
  initialState,
  reducers: {
    addAccounts: (state, action: PayloadAction<readonly Account[]>) => {
      const accounts = action.payload;
      accounts.forEach((account) => {
        const { address, alias, isShielded, chainId } = account;
        if (!state.derived[chainId]) {
          state.derived[chainId] = {};
        }

        state.derived[chainId][address] = {
          address,
          alias,
          chainId,
          isShielded,
        };
      });
    },
  },
});

const { actions, reducer } = accountsSlice;

export const { addAccounts } = actions;
export default reducer;
