import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RpcClient } from "@anoma/rpc";
import { Symbols, Tokens, TokenType } from "@anoma/tx";

import Config from "config";
import { DerivedAccount } from "./accounts";

type Balance = {
  chainId: string;
  accountId: string;
  token: TokenType;
  balance: number;
};

const BALANCES_ACTIONS_BASE = "balances";
export type BalanceByToken = Record<string, number>;
export type BalancesState = Record<string, Record<string, BalanceByToken>>;

type FetchBalancesResults = {
  chainId: string;
  balancesByAccount: Record<string, BalanceByToken>;
};

const initialState: BalancesState = {};
enum BalancesThunkActions {
  FetchBalanceByAccounts = "fetchBalancesByAccounts",
  FetchBalanceByToken = "fetchBalanceByToken",
}

export const fetchBalanceByToken = createAsyncThunk(
  `${BALANCES_ACTIONS_BASE}/${BalancesThunkActions.FetchBalanceByToken}`,
  async (args: {
    chainId: string;
    token: TokenType;
    account: DerivedAccount;
  }) => {
    const { token, account } = args;

    const { chainId, id: accountId, establishedAddress } = account;
    const chainConfig = Config.chain[chainId];
    const rpcClient = new RpcClient(chainConfig.network);
    const { address: tokenAddress = "" } = Tokens[token];

    const balance = establishedAddress
      ? await rpcClient.queryBalance(tokenAddress, establishedAddress)
      : 0;

    return {
      token,
      chainId,
      accountId,
      balance: Math.max(balance, 0),
    };
  }
);

export const fetchBalances = createAsyncThunk(
  `${BALANCES_ACTIONS_BASE}/${BalancesThunkActions.FetchBalanceByAccounts}`,
  async (args: { chainId: string; accounts: DerivedAccount[] }) => {
    const { chainId, accounts } = args;

    const balances = await Promise.all(
      accounts.map(async (account) => {
        const { chainId, id: accountId, establishedAddress } = account;
        const chainConfig = Config.chain[chainId];
        const rpcClient = new RpcClient(chainConfig.network);

        const results = await Promise.all(
          Symbols.map(async (token) => {
            const { address: tokenAddress = "" } = Tokens[token];

            const balance = establishedAddress
              ? await rpcClient.queryBalance(tokenAddress, establishedAddress)
              : 0;

            return {
              token,
              chainId,
              accountId,
              balance: Math.max(balance, 0),
            };
          })
        );

        return results;
      })
    );

    const balancesByAccount = balances.reduce(
      (acc: Record<string, BalanceByToken>, balances) => {
        balances.forEach((balanceByToken) => {
          const { accountId, token, balance } = balanceByToken;

          if (!acc[accountId]) {
            acc[accountId] = {};
          }
          if (!acc[accountId][token]) {
            acc[accountId][token] = balance;
          }
        });

        return acc;
      },
      {}
    );

    return {
      chainId,
      balancesByAccount,
    };
  }
);

const balancesSlice = createSlice({
  name: BALANCES_ACTIONS_BASE,
  initialState,
  reducers: {
    updateBalance: (state, action: PayloadAction<Balance>) => {
      const { chainId, accountId, token, balance } = action.payload;

      if (!state[chainId]) {
        state[chainId] = {};
      }

      if (!state[chainId][accountId]) {
        state[chainId][accountId] = {};
      }

      state[chainId][accountId][token] = balance;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchBalanceByToken.fulfilled,
      (state, action: PayloadAction<Balance>) => {
        const { chainId, accountId, token, balance } = action.payload;

        // Perhaps this isn't needed?
        if (!state[chainId]) {
          state[chainId] = {};
        }

        if (!state[chainId][accountId]) {
          state[chainId][accountId] = {};
        }

        state[chainId][accountId][token] = balance;
      }
    ),
      builder.addCase(
        fetchBalances.fulfilled,
        (state, action: PayloadAction<FetchBalancesResults>) => {
          const { chainId, balancesByAccount } = action.payload;

          const accountIds = Object.keys(balancesByAccount);

          if (!state[chainId]) {
            state[chainId] = {};
          }

          accountIds.forEach((accountId) => {
            if (!state[chainId][accountId]) {
              state[chainId][accountId] = {};
            }
            state[chainId][accountId] = balancesByAccount[accountId];
          });
        }
      );
  },
});

const { actions, reducer } = balancesSlice;
export const { updateBalance } = actions;

export default reducer;
