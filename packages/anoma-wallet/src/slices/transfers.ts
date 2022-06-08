import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Config, { RPCConfig } from "config";
import { FAUCET_ADDRESS, Tokens, TokenType, TxResponse } from "constants/";
import { IbcTxResponse } from "constants/tx";
import { RpcClient, SocketClient, Transfer, IBCTransfer } from "lib";
import { NewBlockEvents } from "lib/rpc/types";
import { amountFromMicro, promiseWithTimeout } from "utils/helpers";
import { DerivedAccount, fetchBalanceByAccount } from "./accounts";

enum TransferType {
  IBC = "IBC",
  Shielded = "Shielded",
  NonShielded = "Non-Shielded",
}

export type IBCTransferAttributes = {
  sourceChannel: string;
  sourcePort: string;
  destinationChannel: string;
  destinationPort: string;
  timeoutHeight: number;
  timeoutTimestamp: number;
  chainId: string;
};

export type TransferTransaction = {
  chainId: string;
  source: string;
  target: string;
  type: TransferType;
  amount: number;
  height: number;
  tokenType: TokenType;
  gas: number;
  appliedHash: string;
  memo: string;
  timestamp: number;
  ibcTransfer?: IBCTransferAttributes;
};

type TransferEvents = {
  gas: number;
  appliedHash: string;
};

export type TransfersState = {
  transactions: TransferTransaction[];
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

type TxArgs = {
  chainId: string;
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
  chainId: string;
  channelId: string;
  portId: string;
};

const LEDGER_TRANSFER_TIMEOUT = 10000;
const IBC_TRANSFER_TIMEOUT = 15000;

export const submitTransferTransaction = createAsyncThunk(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitTransferTransaction}`,
  async (
    {
      chainId,
      account,
      target,
      amount,
      memo,
      shielded,
      useFaucet,
    }: TxTransferArgs,
    { dispatch, rejectWithValue }
  ) => {
    const {
      id,
      establishedAddress = "",
      tokenType,
      signingKey: privateKey,
    } = account;

    const source = useFaucet ? FAUCET_ADDRESS : establishedAddress;

    const chainConfig = Config.chain[chainId];
    const { url, port, protocol, wsProtocol } = chainConfig.network;
    const rpcConfig = new RPCConfig(url, port, protocol, wsProtocol);
    const rpcClient = new RpcClient(rpcConfig.network);
    const socketClient = new SocketClient(rpcConfig.wsNetwork);

    const epoch = await rpcClient.queryEpoch();
    const transfer = await new Transfer().init();
    const token = Tokens[tokenType];

    const { hash, bytes } = await transfer.makeTransfer({
      source,
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

    const code = events[TxResponse.Code][0];
    const info = events[TxResponse.Info][0];

    if (code !== "0") {
      return rejectWithValue(info);
    }

    const gas = amountFromMicro(parseInt(events[TxResponse.GasUsed][0]));
    const appliedHash = events[TxResponse.Hash][0];
    const height = parseInt(events[TxResponse.Height][0]);

    dispatch(fetchBalanceByAccount(account));

    return {
      id,
      useFaucet,
      transaction: {
        chainId,
        source,
        target,
        appliedHash,
        tokenType,
        amount,
        memo,
        gas,
        height,
        timestamp: new Date().getTime(),
        type: shielded ? TransferType.Shielded : TransferType.NonShielded,
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
      chainId,
    }: TxIbcTransferArgs,
    { rejectWithValue }
  ) => {
    const {
      establishedAddress: source = "",
      tokenType,
      signingKey: privateKey,
    } = account;
    const chainConfig = Config.chain[chainId];
    const { url, port, protocol, wsProtocol } = chainConfig.network;
    const rpcConfig = new RPCConfig(url, port, protocol, wsProtocol);
    const rpcClient = new RpcClient(rpcConfig.network);
    const socketClient = new SocketClient(rpcConfig.wsNetwork);

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

    // Get transaction events
    const gas = amountFromMicro(parseInt(events[TxResponse.GasUsed][0]));
    const appliedHash = events[TxResponse.Hash][0];
    const height = parseInt(events[TxResponse.Height][0]);

    // Get IBC events
    const sourceChannel = events[IbcTxResponse.SourceChannel][0];
    const sourcePort = events[IbcTxResponse.SourcePort][0];
    const destinationChannel = events[IbcTxResponse.DestinationChannel][0];
    const destinationPort = events[IbcTxResponse.DestinationPort][0];
    const timeoutHeight = parseInt(events[IbcTxResponse.TimeoutHeight][0]);
    const timeoutTimestamp = parseInt(
      events[IbcTxResponse.TimeoutTimestamp][0]
    );

    return {
      chainId,
      appliedHash,
      tokenType,
      source,
      target,
      amount,
      memo,
      shielded: false,
      gas,
      height,
      timestamp: new Date().getTime(),
      type: TransferType.IBC,
      ibcTransfer: {
        chainId,
        sourceChannel,
        sourcePort,
        destinationChannel,
        destinationPort,
        timeoutHeight,
        timeoutTimestamp,
      },
    };
  }
);

const initialState: TransfersState = {
  transactions: [],
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
        const { useFaucet, transaction } = action.payload;
        const { gas, appliedHash } = transaction;

        state.isTransferSubmitting = false;
        state.transferError = undefined;

        state.events = !useFaucet
          ? {
              gas,
              appliedHash,
            }
          : undefined;

        state.transactions.push(transaction);
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
      (state, action: PayloadAction<TransferTransaction>) => {
        const transaction = action.payload;
        const { gas, appliedHash } = transaction;

        state.isIbcTransferSubmitting = false;
        state.transferError = undefined;

        state.events = {
          gas,
          appliedHash,
        };

        state.transactions.push(transaction);
      }
    );
  },
});

const { actions, reducer } = transfersSlice;
export const { clearEvents, clearErrors } = actions;
export default reducer;
