import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Config from "config";
import { FAUCET_ADDRESS, Tokens, TokenType, TxResponse } from "constants/";
import { RpcClient, SocketClient, Transfer, IBCTransfer } from "lib";
import { NewBlockEvents } from "lib/rpc/types";
import { amountFromMicro, promiseWithTimeout } from "utils/helpers";
import { DerivedAccount, fetchBalanceByAccount } from "./accounts";

enum TransferType {
  Sent = "Sent",
  Received = "Received",
  IBCTransfer = "IBC Transfer",
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
  isIbcTransferSubmitting: boolean;
  transferError?: string;
  events?: TransferEvents;
};

const TRANSFERS_ACTIONS_BASE = "transfers";

enum TransfersThunkActions {
  SubmitTransferTransaction = "submitTransferTransaction",
  SubmitIbcTransferTransaction = "submitIbcTransferTransaction",
}

const { network, wsNetwork } = Config.rpc;
const rpcClient = new RpcClient(network);
const socketClient = new SocketClient(wsNetwork);

type TxArgs = {
  account: DerivedAccount;
  target: string;
  amount: number;
  memo: string;
  feeAmount?: number;
};

type TxTransferArgs = TxArgs & {
  shielded: boolean;
  useFaucet?: boolean;
};

type TxIbcTransferArgs = TxArgs & {
  channelId: string;
  portId: string;
};

const LEDGER_TRANSFER_TIMEOUT = 10000;
const IBC_TRANSFER_TIMEOUT = 15000;

export const submitTransferTransaction = createAsyncThunk(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitTransferTransaction}`,
  async (
    { account, target, amount, memo, shielded, useFaucet }: TxTransferArgs,
    { dispatch, rejectWithValue }
  ) => {
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

    const { promise, timeoutId } = promiseWithTimeout<NewBlockEvents>(
      new Promise(async (resolve) => {
        await socketClient.broadcastTx(bytes);
        const events = await socketClient.subscribeNewBlock(hash);
        resolve(events);
      }),
      LEDGER_TRANSFER_TIMEOUT,
      `Async actions timed out when submitting Token Transfer after ${
        LEDGER_TRANSFER_TIMEOUT / 1000
      } seconds`
    );

    promise.catch((e) => {
      socketClient.disconnect();
      return rejectWithValue(e);
    });

    const events = await promise;
    socketClient.disconnect();
    clearTimeout(timeoutId);

    const gas = amountFromMicro(parseInt(events[TxResponse.GasUsed][0]));
    const appliedHash = events[TxResponse.Hash][0];
    const height = parseInt(events[TxResponse.Height][0]);

    dispatch(fetchBalanceByAccount(account));

    return {
      id,
      useFaucet,
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

export const submitIbcTransferTransaction = createAsyncThunk(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitIbcTransferTransaction}`,
  async (
    {
      account,
      target,
      amount,
      memo,
      feeAmount = 0,
      channelId,
      portId,
    }: TxIbcTransferArgs,
    { rejectWithValue }
  ) => {
    const {
      id,
      establishedAddress: source = "",
      tokenType,
      signingKey: privateKey,
    } = account;
    const epoch = await rpcClient.queryEpoch();
    const transfer = await new IBCTransfer().init();
    const token = Tokens[tokenType];

    const { hash, bytes } = await transfer.makeIbcTransfer({
      source,
      target,
      token: token.address || "",
      amount,
      epoch,
      privateKey,
      portId,
      channelId,
      feeAmount,
    });

    const { promise, timeoutId } = promiseWithTimeout<NewBlockEvents>(
      new Promise(async (resolve) => {
        await socketClient.broadcastTx(bytes);
        const events = await socketClient.subscribeNewBlock(hash);
        resolve(events);
      }),
      IBC_TRANSFER_TIMEOUT,
      `Async actions timed out when submitting IBC Transfer after ${
        IBC_TRANSFER_TIMEOUT / 1000
      } seconds`
    );

    promise.catch((e) => {
      socketClient.disconnect();
      return rejectWithValue(e);
    });

    const events = await promise;
    socketClient.disconnect();
    clearTimeout(timeoutId);

    const code = events[TxResponse.Code][0];
    const info = events[TxResponse.Info][0];

    if (code !== "0") {
      return rejectWithValue(info);
    }

    const gas = amountFromMicro(parseInt(events[TxResponse.GasUsed][0]));
    const appliedHash = events[TxResponse.Hash][0];
    const height = parseInt(events[TxResponse.Height][0]);

    return {
      id,
      transaction: {
        appliedHash,
        tokenType,
        target,
        amount,
        memo,
        shielded: false,
        gas,
        height,
        timestamp: new Date().getTime(),
        type: TransferType.IBCTransfer,
      },
    };
  }
);

const initialState: TransfersState = {
  transactions: {},
  isTransferSubmitting: false,
  isIbcTransferSubmitting: false,
};

const transfersSlice = createSlice({
  name: TRANSFERS_ACTIONS_BASE,
  initialState,
  reducers: {
    clearEvents: (state) => {
      state.events = undefined;
      state.isTransferSubmitting = false;
    },
    clearErrors: (state) => {
      state.transferError = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(submitTransferTransaction.pending, (state) => {
      state.isTransferSubmitting = true;
      state.transferError = undefined;
      state.events = undefined;
    });

    builder.addCase(submitTransferTransaction.rejected, (state, action) => {
      const { error } = action;
      state.isTransferSubmitting = false;
      state.transferError = error.message;
      state.events = undefined;
    });

    builder.addCase(
      submitTransferTransaction.fulfilled,
      (
        state,
        action: PayloadAction<{
          id: string;
          useFaucet: boolean | undefined;
          transaction: TransferTransaction;
        }>
      ) => {
        const { id, useFaucet, transaction } = action.payload;
        const { gas, appliedHash } = transaction;
        const transactions = state.transactions[id] || [];
        transactions.push(transaction);

        state.isTransferSubmitting = false;
        state.transferError = undefined;

        state.events = !useFaucet
          ? {
              gas,
              appliedHash,
            }
          : undefined;

        state.transactions = {
          ...state.transactions,
          [id]: transactions,
        };
      }
    );

    builder.addCase(submitIbcTransferTransaction.pending, (state) => {
      state.isIbcTransferSubmitting = true;
      state.transferError = undefined;
      state.events = undefined;
    });

    builder.addCase(submitIbcTransferTransaction.rejected, (state, action) => {
      const { error, payload } = action;
      state.isIbcTransferSubmitting = false;
      state.transferError = (payload as string) || error.message;
      state.events = undefined;
    });

    builder.addCase(
      submitIbcTransferTransaction.fulfilled,
      (
        state,
        action: PayloadAction<{
          id: string;
          transaction: TransferTransaction;
        }>
      ) => {
        const { id, transaction } = action.payload;
        const { gas, appliedHash } = transaction;

        const transactions = state.transactions[id] || [];
        transactions.push(transaction);

        state.isIbcTransferSubmitting = false;
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
export const { clearEvents, clearErrors } = actions;
export default reducer;
