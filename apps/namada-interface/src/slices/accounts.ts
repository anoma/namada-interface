import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account } from "@anoma/types";

// TODO: Remove the following once configuration updates are in place:
// See notes below.
import { defaultChainId as chainId } from "config";

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
        /**
         * For now, use the default chainId.
         * TODO - Use chainId from accounts below, as we
         * need to support multiple chains:
         */
        const { address, alias, isShielded } = account;
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
