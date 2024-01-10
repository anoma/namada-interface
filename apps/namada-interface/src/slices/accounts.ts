import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";

import { Account as AccountDetails, ChainKey, TokenType } from "@namada/types";
import { chains } from "@namada/chains";
import { getIntegration } from "@namada/integrations";

import { RootState } from "store";

type Address = string;
type Details = AccountDetails;

export type Balance = Partial<Record<TokenType, BigNumber>>;
export type Account = { details: Details; balance: Balance };

export type AccountsState = {
  derived: Record<ChainKey, Record<Address, Account>>;
};

const ACCOUNTS_ACTIONS_BASE = "accounts";

const INITIAL_STATE = {
  derived: {
    namada: {},
    cosmos: {},
    ethereum: {},
  }
};

enum AccountsThunkActions {
  FetchBalances = "fetchBalances",
  FetchBalance = "fetchBalance",
}

const initialState: AccountsState = INITIAL_STATE;

export const fetchBalances = createAsyncThunk<void, void, { state: RootState }>(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountsThunkActions.FetchBalances}`,
  async (_, thunkApi) => {
    const { id } = chains.namada
    const accounts: Account[] = Object.values(
      thunkApi.getState().accounts.derived[id]
    );

    accounts.forEach((account) => thunkApi.dispatch(fetchBalance(account)));
  }
);

export const fetchBalance = createAsyncThunk<
  {
    chainId: string;
    address: string;
    balance: Balance;
  },
  Account,
  { state: RootState }
>(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountsThunkActions.FetchBalance}`,
  async (account) => {
    const integration = getIntegration(chains.namada.id);

    const { address, chainId: accountChainId } = account.details;

    const results = await integration.queryBalances(address);

    const balance = results.reduce(
      (acc, curr) => ({ ...acc, [curr.token]: new BigNumber(curr.amount) }),
      {} as Balance
    );

    return { chainId: accountChainId, address, balance };
  }
);

const accountsSlice = createSlice({
  name: ACCOUNTS_ACTIONS_BASE,
  initialState,
  reducers: {
    addAccounts: (state, action: PayloadAction<readonly AccountDetails[]>) => {
      const accounts = action.payload;

      const { chainId } = accounts[0] || "";
      const chain = Object.values(chains).find((chain) => chain.chainId === chainId);

      if (!chain) {
        return;
      }
      // Remove old accounts under this chainId if present:
      if (state.derived[chain.id]) {
        state.derived[chain.id] = {};
      }

      accounts.forEach((account) => {
        const { address, alias, isShielded, chainId, type, publicKey } =
          account;
        const currencySymbol = chains.namada.currency.symbol;
        if (!state.derived[chain.id]) {
          state.derived[chain.id] = {};
        }

        state.derived[chain.id][address] = {
          details: {
            address,
            alias,
            chainId,
            type,
            publicKey,
            isShielded,
          },
          balance: {
            [currencySymbol]: new BigNumber(0),
          },
        };
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchBalance.fulfilled,
      (
        state,
        action: PayloadAction<{
          chainId: string;
          address: string;
          balance: Balance;
        }>
      ) => {
        const { id } = chains.namada
        const { address, balance } = action.payload;
        if (state.derived[id][address]?.balance) {
          state.derived[id][address].balance = balance;
        } else {
          delete state.derived[id][address];
        }

      }
    );
  },
});

const { actions, reducer } = accountsSlice;

export const { addAccounts } = actions;
export default reducer;
