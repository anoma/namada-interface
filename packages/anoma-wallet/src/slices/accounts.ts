import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Config } from "config";
import { Tokens, TokenType } from "constants/";
import { RpcClient } from "lib";
import { stringToHash } from "utils/helpers";

export type DerivedAccount = {
  id: string;
  alias: string;
  tokenType: TokenType;
  address: string;
  publicKey: string;
  signingKey: string;
  balance?: number;
  establishedAddress?: string;
  zip32Address?: string;
};

export type InitialAccount = Omit<DerivedAccount, "id">;

export type Transaction = {
  tokenType: TokenType;
  appliedHash: string;
  target: string;
  amount: number;
  memo?: string;
  shielded: boolean;
  gas: number;
  height: number;
  timestamp: number;
};

type DerivedAccounts = {
  [id: string]: DerivedAccount;
};

type AccountTransactions = {
  [accountId: string]: Transaction[];
};

export type AccountsState = {
  derived: DerivedAccounts;
  transactions: AccountTransactions;
};

const ACCOUNTS_ACTIONS_BASE = "accounts";

enum AccountThunkActions {
  FetchBalanceByAddress = "fetchBalanceByAddress",
}

const { network } = new Config();
const rpcClient = new RpcClient(network);

export const fetchBalanceByAddress = createAsyncThunk(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountThunkActions.FetchBalanceByAddress}`,
  async (account: DerivedAccount) => {
    const { id, establishedAddress, tokenType } = account;
    const { address: tokenAddress = "" } = Tokens[tokenType];
    const balance = await rpcClient.queryBalance(
      tokenAddress,
      establishedAddress
    );
    return {
      id,
      balance: balance > 0 ? balance : 0,
    };
  }
);

const initialState: AccountsState = {
  derived: {},
  transactions: {},
};

const accountsSlice = createSlice({
  name: ACCOUNTS_ACTIONS_BASE,
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<InitialAccount>) => {
      const {
        alias,
        tokenType,
        address,
        publicKey,
        signingKey,
        establishedAddress,
      } = action.payload;

      const id = stringToHash(alias);

      state.derived = {
        ...state.derived,
        [id]: {
          id: id,
          alias,
          tokenType,
          address,
          publicKey,
          signingKey,
          establishedAddress,
        },
      };
    },
    setEstablishedAddress: (
      state,
      action: PayloadAction<{
        alias: string;
        establishedAddress: string;
      }>
    ) => {
      const { alias, establishedAddress } = action.payload;

      const { id } =
        Object.values(state.derived).find(
          (account) => account.alias === alias
        ) || {};

      if (id) {
        state.derived[id] = {
          ...state.derived[id],
          establishedAddress,
        };
      }
    },
    setBalance: (
      state,
      action: PayloadAction<{ id: string; balance: number }>
    ) => {
      const { id, balance } = action.payload;

      state.derived[id] = {
        ...state.derived[id],
        balance,
      };
    },
    setZip32Address: (
      state,
      action: PayloadAction<{
        id: string;
        zip32Address: string;
      }>
    ) => {
      const { id, zip32Address } = action.payload;

      state.derived[id] = {
        ...state.derived[id],
        zip32Address,
      };
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const { derived } = state;

      delete derived[id];
      state.derived = derived;
    },
    renameAccount: (state, action: PayloadAction<[string, string]>) => {
      const [id, newAlias] = action.payload;
      const { derived } = state;

      const account = derived[id];

      derived[id] = {
        ...account,
        alias: newAlias,
      };

      state.derived = derived;
    },
    addTransaction: (
      state,
      action: PayloadAction<{ transaction: Transaction; id: string }>
    ) => {
      const { id, transaction } = action.payload;

      const transactions = state.transactions[id] || [];
      transactions.push(transaction);

      state.transactions = {
        ...state.transactions,
        [id]: transactions,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBalanceByAddress.fulfilled, (state, action) => {
      const { id, balance } = action.payload;

      state.derived[id] = {
        ...state.derived[id],
        balance,
      };
    });
  },
});

const { actions, reducer } = accountsSlice;

export const {
  addAccount,
  setEstablishedAddress,
  setZip32Address,
  removeAccount,
  renameAccount,
  addTransaction,
} = actions;

export default reducer;
