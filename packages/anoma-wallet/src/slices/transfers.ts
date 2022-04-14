import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Config } from "config";
import { FAUCET_ADDRESS, Tokens, TokenType, TxResponse } from "constants/";
import { RpcClient, SocketClient, Transfer } from "lib";
import { amountFromMicro } from "utils/helpers";
import { DerivedAccount } from "./accounts";

enum TransferType {
  Sent,
  Received,
}

export type TransferTransaction = {
  tokenType: TokenType;
  appliedHash: string;
  target: string;
  amount: number;
  memo?: string;
  shielded: boolean;
  gas: number;
  height: number;
  timestamp: number;
  type: TransferType;
};

type TransferTransactions = {
  [accountId: string]: TransferTransaction[];
};

type TransferEvents = {
  gas: number;
  appliedHash: string;
};

export type TransfersState = {
  transactions: TransferTransactions;
  isTransferSubmitting: boolean;
  transferError?: string;
  events?: TransferEvents;
};

const TRANSFERS_ACTIONS_BASE = "transfers";

enum TransfersThunkActions {
  SubmitTransferTransaction = "submitTransferTransaction",
}

const { network, wsNetwork } = new Config();
const rpcClient = new RpcClient(network);
const socketClient = new SocketClient(wsNetwork);

type TxTransferArgs = {
  account: DerivedAccount;
  target: string;
  amount: number;
  memo: string;
  shielded: boolean;
  useFaucet?: boolean;
  callback?: (account?: DerivedAccount) => void;
};

export const submitTransferTransaction = createAsyncThunk(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitTransferTransaction}`,
  async ({
    account,
    target,
    amount,
    memo,
    shielded,
    useFaucet,
    callback,
  }: TxTransferArgs) => {
    const {
      id,
      establishedAddress: source = "",
      tokenType,
      signingKey: privateKey,
    } = account;
    const epoch = await rpcClient.queryEpoch();
    const transfer = await new Transfer().init();
    const token = Tokens[tokenType];

    const { hash, bytes } = await transfer.makeTransfer({
      source: useFaucet ? FAUCET_ADDRESS : source,
      target,
      token: token.address || "",
      amount,
      epoch,
      privateKey,
    });

    await socketClient.broadcastTx(bytes);
    const events = await socketClient.subscribeNewBlock(hash);

    const gas = amountFromMicro(parseInt(events[TxResponse.GasUsed][0]));
    const appliedHash = events[TxResponse.Hash][0];
    const height = parseInt(events[TxResponse.Height][0]);

    if (callback) {
      callback(account);
    }

    return {
      id,
      transaction: {
        appliedHash,
        tokenType,
        target,
        amount,
        memo,
        shielded,
        gas,
        height,
        timestamp: new Date().getTime(),
        type: useFaucet ? TransferType.Received : TransferType.Sent,
      },
    };
  }
);

const initialState: TransfersState = {
  transactions: {},
  isTransferSubmitting: false,
};

const transfersSlice = createSlice({
  name: TRANSFERS_ACTIONS_BASE,
  initialState,
  reducers: {
    clearEvents: (state) => {
      state.events = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(submitTransferTransaction.pending, (state) => {
      state.isTransferSubmitting = true;
      state.transferError = undefined;
      state.events = undefined;
    });

    builder.addCase(submitTransferTransaction.rejected, (state, action) => {
      const { payload: error } = action;
      state.isTransferSubmitting = false;
      state.transferError = `${error}`;
      state.events = undefined;
    });

    builder.addCase(
      submitTransferTransaction.fulfilled,
      (
        state,
        action: PayloadAction<{ id: string; transaction: TransferTransaction }>
      ) => {
        const { id, transaction } = action.payload;
        const { gas, appliedHash } = transaction;
        const transactions = state.transactions[id] || [];
        transactions.push(transaction);

        state.isTransferSubmitting = false;
        state.transferError = undefined;
        state.events = {
          gas,
          appliedHash,
        };

        state.transactions = {
          ...state.transactions,
          [id]: transactions,
        };
      }
    );
  },
});

const { actions, reducer } = transfersSlice;
export const { clearEvents } = actions;
export default reducer;
