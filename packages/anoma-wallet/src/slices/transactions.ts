import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenType } from "constants/";

export type Transaction = {
  tokenType: TokenType;
  appliedHash: string;
  target: string;
  amount: number;
  timestamp: number;
};

type Transactions = {
  [hash: string]: Transaction[];
};

export type TransactionsState = {
  accountTransactions: Transactions;
};

const initialState: TransactionsState = {
  accountTransactions: {},
};

const accountsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    addTransaction: (
      state,
      action: PayloadAction<Transaction & { hash: string }>
    ) => {
      const { hash, tokenType, appliedHash, amount, target, timestamp } =
        action.payload;

      const transactions = state.accountTransactions[hash] || [];
      transactions.push({
        tokenType,
        appliedHash,
        amount,
        target,
        timestamp,
      });

      state.accountTransactions = {
        ...state.accountTransactions,
        [hash]: transactions,
      };
    },
  },
});

const { actions, reducer } = accountsSlice;

export const { addTransaction } = actions;

export default reducer;
