import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";

import { defaultChainId as chainId, chains } from "@namada/chains";
import { getIntegration } from "@namada/integrations";
import { Account as AccountDetails, TokenType } from "@namada/types";

import { RootState } from "store";

type ChainId = string;
type Address = string;
type Details = AccountDetails;

export type Balance = Partial<Record<TokenType, BigNumber>>;
export type Account = { details: Details; balance: Balance };

export type AccountsState = {
  derived: Record<ChainId, Record<Address, Account>>;
};

const ACCOUNTS_ACTIONS_BASE = "accounts";

const INITIAL_STATE = {
  derived: Object.keys(chains).reduce(
    (acc, curr) => ({ ...acc, [curr]: {} }),
    {}
  ),
};

enum AccountsThunkActions {
  FetchBalances = "fetchBalances",
  FetchBalance = "fetchBalance",
}

const initialState: AccountsState = INITIAL_STATE;

export const fetchBalances = createAsyncThunk<void, void, { state: RootState }>(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountsThunkActions.FetchBalances}`,
  async (_, thunkApi) => {
    const accounts: Account[] = Object.values(
      thunkApi.getState().accounts.derived[chainId]
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
    const integration = getIntegration(chainId);

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

      // Remove old accounts under this chainId if present:
      if (accounts[0] && state.derived[accounts[0].chainId]) {
        state.derived[accounts[0].chainId] = {};
      }

      accounts.forEach((account) => {
        const { address, alias, isShielded, chainId, type, publicKey } =
          account;
        const currencySymbol = chains[chainId].currency.symbol;
        if (!state.derived[chainId]) {
          state.derived[chainId] = {};
        }

        state.derived[chainId][address] = {
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
        const { chainId, address, balance } = action.payload;
        if (state.derived[chainId][address]?.balance) {
          state.derived[chainId][address].balance = balance;
        } else {
          delete state.derived[chainId][address];
        }
      }
    );
  },
});

const { actions, reducer } = accountsSlice;

export const { addAccounts } = actions;
export default reducer;
