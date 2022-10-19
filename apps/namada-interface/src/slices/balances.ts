import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account } from "@anoma/types";

import { RpcClient } from "@anoma/rpc";
import { Symbols, Tokens, TokenType } from "@anoma/tx";

import Config from "config";

type Balance = {
  chainId: string;
  address: string;
  token: TokenType;
  balance: number;
};

const BALANCES_ACTIONS_BASE = "balances";
export type BalanceByToken = Record<string, number>;
export type BalancesState = Record<string, Record<string, BalanceByToken>>;

type FetchBalancesResults = {
  balancesByAccount: Record<string, BalanceByToken>;
};

const initialState: BalancesState = {};
enum BalancesThunkActions {
  FetchBalanceByAccounts = "fetchBalancesByAccounts",
  FetchBalanceByToken = "fetchBalanceByToken",
}

export const fetchBalanceByToken = createAsyncThunk(
  `${BALANCES_ACTIONS_BASE}/${BalancesThunkActions.FetchBalanceByToken}`,
  async (args: { token: TokenType; account: Account }) => {
    const { token, account } = args;

    const { chainId, address } = account;
    const chainConfig = Config.chain[chainId];
    const rpcClient = new RpcClient(chainConfig.network);
    const { address: tokenAddress = "" } = Tokens[token];

    const balance = await rpcClient.queryBalance(tokenAddress, address);

    return {
      token,
      chainId,
      address,
      balance: Math.max(balance, 0),
    };
  }
);

export const fetchBalances = createAsyncThunk(
  `${BALANCES_ACTIONS_BASE}/${BalancesThunkActions.FetchBalanceByAccounts}`,
  async (accounts: Account[]) => {
    const balances = await Promise.all(
      accounts.map(async (account) => {
        const { chainId, address } = account;
        const chainConfig = Config.chain[chainId];
        const rpcClient = new RpcClient(chainConfig.network);

        const results = await Promise.all(
          Symbols.map(async (token) => {
            const { address: tokenAddress = "" } = Tokens[token];

            const balance = await rpcClient.queryBalance(tokenAddress, address);

            return {
              token,
              chainId,
              address,
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
          const { address, token, balance } = balanceByToken;

          if (!acc[address]) {
            acc[address] = {};
          }
          if (!acc[address][token]) {
            acc[address][token] = balance;
          }
        });

        return acc;
      },
      {}
    );

    return {
      balancesByAccount,
    };
  }
);

const balancesSlice = createSlice({
  name: BALANCES_ACTIONS_BASE,
  initialState,
  reducers: {
    updateBalance: (state, action: PayloadAction<Balance>) => {
      const { chainId, address, token, balance } = action.payload;

      if (!state[chainId]) {
        state[chainId] = {};
      }

      if (!state[chainId][address]) {
        state[chainId][address] = {};
      }

      state[chainId][address][token] = balance;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchBalanceByToken.fulfilled,
      (state, action: PayloadAction<Balance>) => {
        const { chainId, address, token, balance } = action.payload;

        // Perhaps this isn't needed?
        if (!state[chainId]) {
          state[chainId] = {};
        }

        if (!state[chainId][address]) {
          state[chainId][address] = {};
        }

        state[chainId][address][token] = balance;
      }
    ),
      builder.addCase(
        fetchBalances.fulfilled,
        (state, action: PayloadAction<FetchBalancesResults>) => {
          const { balancesByAccount } = action.payload;

          const accountIds = Object.keys(balancesByAccount);

          accountIds.forEach((accountId) => {
            const { chainId } = balancesByAccount[accountId];
            if (!state[chainId]) {
              state[chainId] = {};
            }
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
