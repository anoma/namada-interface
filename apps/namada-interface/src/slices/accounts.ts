import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account, TokenType } from "@anoma/types";

type ChainId = string;
type Address = string;

export type Balance = Record<TokenType, number>;

export type AccountsState = {
  derived: Record<
    ChainId,
    Record<Address, { account: Account; balance: Balance }>
  >;
};

const EMPTY_BALANCE = {
  NAM: 0,
  ATOM: 0,
  ETH: 0,
  DOT: 0,
  BTC: 0,
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
          account: {
            address,
            alias,
            chainId,
            isShielded,
          },
          balance: EMPTY_BALANCE,
        };
      });
    },
  },
});

const { actions, reducer } = accountsSlice;

export const { addAccounts } = actions;
export default reducer;
