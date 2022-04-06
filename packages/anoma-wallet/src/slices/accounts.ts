import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Config } from "config";
import { Tokens, TokenType } from "constants/";
import { RpcClient } from "lib";
import { stringToHash } from "utils/helpers";

export type DerivedAccount = {
  alias: string;
  tokenType: TokenType;
  address: string;
  publicKey: string;
  signingKey: string;
  balance?: number;
  establishedAddress?: string;
  zip32Address?: string;
};

export type Transaction = {
  tokenType: TokenType;
  appliedHash: string;
  target: string;
  amount: number;
  memo?: string;
  shielded: boolean;
  gas: number;
  timestamp: number;
};

type DerivedAccounts = {
  [hash: string]: DerivedAccount;
};

type Transactions = {
  [hash: string]: Transaction[];
};

export type AccountsState = {
  derived: DerivedAccounts;
  transactions: Transactions;
};

const { network } = new Config();
const rpcClient = new RpcClient(network);

export const fetchBalanceByAddress = createAsyncThunk(
  "accounts/fetchBalanceByAddress",
  async (account: DerivedAccount) => {
    const { alias, establishedAddress, tokenType } = account;
    const { address: tokenAddress = "" } = Tokens[tokenType];
    const balance = await rpcClient.queryBalance(
      tokenAddress,
      establishedAddress
    );
    return {
      alias,
      balance: balance > 0 ? balance : 0,
    };
  }
);

const initialState: AccountsState = {
  derived: {},
  transactions: {},
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<DerivedAccount>) => {
      const {
        alias,
        tokenType,
        address,
        publicKey,
        signingKey,
        establishedAddress,
      } = action.payload;

      const hash = stringToHash(alias);

      state.derived = {
        ...state.derived,
        [hash]: {
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
      const hash = stringToHash(alias);

      state.derived[hash] = {
        ...state.derived[hash],
        establishedAddress,
      };
    },
    setBalance: (
      state,
      action: PayloadAction<{ alias: string; balance: number }>
    ) => {
      const { alias, balance } = action.payload;
      const hash = stringToHash(alias);
      state.derived[hash] = {
        ...state.derived[hash],
        balance,
      };
    },
    setZip32Address: (
      state,
      action: PayloadAction<{
        alias: string;
        zip32Address: string;
      }>
    ) => {
      const { alias, zip32Address } = action.payload;
      const hash = stringToHash(alias);

      state.derived[hash] = {
        ...state.derived[hash],
        zip32Address,
      };
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      const alias = action.payload;
      const { derived } = state;
      const hash = stringToHash(alias);

      delete derived[hash];
      state.derived = derived;
    },
    renameAccount: (state, action: PayloadAction<[string, string]>) => {
      const [previousAlias, newAlias] = action.payload;
      const { derived } = state;
      const previousHash = stringToHash(previousAlias);
      const newHash = stringToHash(newAlias);

      const account = { ...derived[previousHash] };
      delete derived[previousAlias];
      derived[newHash] = {
        ...account,
        alias: newAlias,
      };

      state.derived = derived;
    },
    addTransaction: (
      state,
      action: PayloadAction<Transaction & { hash: string }>
    ) => {
      const {
        hash,
        tokenType,
        appliedHash,
        target,
        amount,
        memo,
        shielded = false,
        gas,
        timestamp,
      } = action.payload;

      const transactions = state.transactions[hash] || [];
      transactions.push({
        tokenType,
        appliedHash,
        amount,
        memo,
        shielded,
        gas,
        target,
        timestamp,
      });

      state.transactions = {
        ...state.transactions,
        [hash]: transactions,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBalanceByAddress.fulfilled, (state, action) => {
      const { alias, balance } = action.payload;
      const hash = stringToHash(alias);
      state.derived[hash] = {
        ...state.derived[hash],
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
