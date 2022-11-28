import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Account, Symbols, Tokens, TokenType } from "@anoma/types";
import { RpcClient } from "@anoma/rpc";

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

        const results: Balance[] = await Promise.all(
          Symbols.map(async (token) => {
            const { address: tokenAddress = "" } = Tokens[token];
            let balance: number;
            try {
              balance = await rpcClient.queryBalance(tokenAddress, address);
            } catch (e) {
              balance = 0;
            }
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

    return balances;
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

        if (!state[chainId]) {
          state[chainId] = {};
        }

        if (!state[chainId][address]) {
          state[chainId][address] = {};
        }

        state[chainId][address][token] = balance;
      }
    );
    builder.addCase(
      fetchBalances.fulfilled,
      (state, action: PayloadAction<Balance[][]>) => {
        const result = action.payload;

        result.forEach((balances) => {
          balances.forEach((tokenBalance) => {
            const { chainId, address, token, balance } = tokenBalance;

            if (!state[chainId]) {
              state[chainId] = {};
            }

            if (!state[chainId][address]) {
              state[chainId][address] = {};
            }

            state[chainId][address][token] = balance;
          });
        });
      }
    );
  },
});

const { actions, reducer } = balancesSlice;
export const { updateBalance } = actions;

export default reducer;
