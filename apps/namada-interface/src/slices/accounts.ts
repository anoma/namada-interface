import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account as AccountDetails, Tokens, TokenType } from "@anoma/types";
import { RootState } from "store";
import { chains } from "@anoma/chains";
import { RpcClient } from "@anoma/rpc";

type ChainId = string;
type Address = string;
type Details = AccountDetails;

export type Balance = Partial<Record<TokenType, number>>;
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

// TODO: We need to update this to also support balance queries from Cosmos, Osmosis, etc.
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
    const accounts: Account[] = Object.values(
      thunkApi.getState().accounts.derived[chainId]
    );

    const balances = await Promise.all(
      accounts.map(async ({ details, balance: currentBalance }) => {
        const { chainId, address } = details;
        const { rpc } = chains[chainId];
        const rpcClient = new RpcClient(rpc);

        const results = await Promise.all(
          Object.keys(currentBalance).map(async (balanceKey) => {
            const tokenType = balanceKey as TokenType;
            const { address: tokenAddress = "" } = Tokens[tokenType];
            let balance: number;
            try {
              balance = await rpcClient.queryBalance(tokenAddress, address);
            } catch (e) {
              balance = 0;
            }
            return {
              tokenType,
              amount: Math.max(balance, 0),
            };
          })
        );

        const balance = results.reduce(
          (acc, curr) => ({ ...acc, [curr.tokenType]: curr.amount }),
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
            [currencySymbol]: 0,
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
