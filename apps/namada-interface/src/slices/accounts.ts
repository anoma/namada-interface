import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DerivedAccount = {
  alias: string;
  address: string;
  balance?: number;
  chainId: string;
  publicKey: string;
  isShielded?: boolean;
};

type DerivedAccounts = {
  [address: string]: DerivedAccount;
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
    addAccounts: (
      state,
      action: PayloadAction<{ chainId: ChainId; accounts: DerivedAccount[] }>
    ) => {
      const { chainId, accounts } = action.payload;

      if (!state.derived[chainId]) {
        state.derived[chainId] = {};
      }

      accounts.forEach((account) => {
        const { address, alias, publicKey, isShielded } = account;

        state.derived[chainId][address] = {
          address,
          alias,
          chainId,
          publicKey,
          isShielded,
        };
      });
    },
  },
});

const { actions, reducer } = accountsSlice;

export const { addAccounts } = actions;
export default reducer;
