import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account } from "@anoma/types";

// TODO: REMOVE THIS TYPE! USE SHARED TYPE INSTEAD!
export type DerivedAccount = {
  alias: string;
  address: string;
  balance?: number;
  chainId: string;
  publicKey: string;
  isShielded?: boolean;
};

type DerivedAccounts = {
  [address: string]: Account;
};

type ChainId = string;

export type AccountsState = {
  derived: Record<ChainId, DerivedAccounts>;
};

const ACCOUNTS_ACTIONS_BASE = "accounts";

const initialState: AccountsState = {
  derived: {},
};

const accountsSlice = createSlice({
  name: ACCOUNTS_ACTIONS_BASE,
  initialState,
  reducers: {
    addAccounts: (state, action: PayloadAction<Account[]>) => {
      const accounts = action.payload;

      accounts.forEach((account) => {
        const { address, alias, chainId, isShielded } = account;
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
