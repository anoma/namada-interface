import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";

import { Account as AccountDetails, TokenType } from "@anoma/types";
import { chains } from "@anoma/chains";
import { getIntegration } from "@anoma/hooks";

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
  FetchBalance = "fetchBalance",
}

const initialState: AccountsState = INITIAL_STATE;

export const fetchBalances = createAsyncThunk<
  {
    chainId: string;
    address: string;
    balance: Balance;
  }[],
  void,
  { state: RootState }
>(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountsThunkActions.FetchBalance}`,
  async (_, thunkApi) => {
    const { chainId } = thunkApi.getState().settings;
    const integration = getIntegration(chainId);
    const accounts: Account[] = Object.values(
      thunkApi.getState().accounts.derived[chainId]
    );

    const balances = await Promise.all(
      accounts.map(async ({ details }) => {
        const { chainId, address } = details;

        const results = await integration.queryBalances(address);

        const balance = results.reduce(
          (acc, curr) => ({ ...acc, [curr.token]: new BigNumber(curr.amount) }),
          {} as Balance
        );

        return { chainId, address, balance };
      })
    );

    return balances;
  }
);

const accountsSlice = createSlice({
  name: ACCOUNTS_ACTIONS_BASE,
  initialState,
  reducers: {
    addAccounts: (state, action: PayloadAction<readonly AccountDetails[]>) => {
      const accounts = action.payload;

      // Remove old accounts under this chainId if present:
      state.derived[accounts[0].chainId] = {};

      accounts.forEach((account) => {
        const { address, alias, isShielded, chainId } = account;
        const currencySymbol = chains[chainId].currency.symbol;
        if (!state.derived[chainId]) {
          state.derived[chainId] = {};
        }

        state.derived[chainId][address] = {
          details: {
            address,
            alias,
            chainId,
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
      fetchBalances.fulfilled,
      (
        state,
        action: PayloadAction<
          {
            chainId: string;
            address: string;
            balance: Balance;
          }[]
        >
      ) => {
        action.payload.forEach((account) => {
          const { chainId, address, balance } = account;
          state.derived[chainId][address].balance = balance;
        });
      }
    );
  },
});

const { actions, reducer } = accountsSlice;

export const { addAccounts } = actions;
export default reducer;
