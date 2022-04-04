import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenType } from "constants/";

export type Transaction = {
  tokenType: TokenType;
  target: string;
  amount: number;
  timestamp: Date;
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
      const { hash, tokenType, amount, target, timestamp } = action.payload;

      const transactions = state.accountTransactions[hash] || [];
      transactions.push({
        tokenType,
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
