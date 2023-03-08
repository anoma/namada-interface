import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account, Tokens, TokenType } from "@anoma/types";
import { RootState } from "store";
import { chains } from "@anoma/chains";
import { RpcClient } from "@anoma/rpc";

type ChainId = string;
type Address = string;

export type Balance = Partial<Record<TokenType, number>>;

export type AccountsState = {
  derived: Record<
    ChainId,
    Record<Address, { account: Account; balance: Balance }>
  >;
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
    const accountsWithBalance = Object.values(
      thunkApi.getState().accounts.derived[chainId]
    );

    const balances = await Promise.all(
      accountsWithBalance.map(async ({ account, balance: currentBalance }) => {
        const { chainId, address } = account;
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
    addAccounts: (state, action: PayloadAction<readonly Account[]>) => {
      const accounts = action.payload;
      accounts.forEach((account) => {
        const { address, alias, isShielded, chainId } = account;
        const currencySymbol = chains[chainId].currency.symbol;
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
