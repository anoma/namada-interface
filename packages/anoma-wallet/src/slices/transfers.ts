import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Config } from "config";
import { FAUCET_ADDRESS, Tokens, TokenType, TxResponse } from "constants/";
import { RpcClient, SocketClient, Transfer } from "lib";
import { NewBlockEvents } from "lib/rpc/types";
import { amountFromMicro, promiseWithTimeout } from "utils/helpers";
import { DerivedAccount, fetchBalanceByAccount } from "./accounts";

import { createShieldedTransfer } from "./shieldedTransfer";
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
};

const LEDGER_TRANSFER_TIMEOUT = 10000;

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
    const transferData = {
      source: useFaucet ? FAUCET_ADDRESS : source,
      target,
      token: token.address || "",
      amount,
      epoch,
      privateKey,
    };

    // we get the hash and bytes for the transaction
    let hash: string;
    let bytes: Uint8Array;

    // memas-spending-key-5
    const spendingKey =
      "xsktest1qqqqqqqqqqqqqqp5testsunq45vj6qgqr75zdu4h2jmuynj3gfd3p42ackctytcvzsmf97xgqz74gysv58xu0l0n77flhyavj4he27fvp96jwf8kkqesu9c95gcyjlwsn4axc2y7l84jfw34dmncs2ua5elg6jyk3lxzkacqfvwevsesftgkcwl483smj6j4glujk6x472qqf6u8ze65ads0fc8msunws09yn3cnxq832f2chqlhf0rhxzwvm72us3s3zmwzg06rhcqt0f54m";

    // ACCOUNT_5_NAME-established
    const transparentAddress =
      "atest1v4ehgw368ymyyvfcgye5zwfhg5crjwzz8pzy23fkggenwd35gcc5xw2pxdp5gw2pgyunzw2pdmjf6h";
    const shieldedInput = false;
    const inputAddress = shieldedInput ? spendingKey : transparentAddress;

    // memas-payment-address-1
    const paymentAddress =
      "patest1cdrf76r0lv8dyww0mdt7mqrau864xqu7qav54k2zc57kmtmd7jccurkznl36mrvqarhmsnp5phc";

    if (shielded) {
      // big TODO: think about the whole concept of how the UX for the shielded
      // transactions should be.
      //
      // if it is shielded we have to first generate it and it will then be included
      // in regular transaction
      const amountInMicros = amount * 1_000_000;
      const shieldedTransaction = await createShieldedTransfer(
        amountInMicros,
        inputAddress,
        paymentAddress
      );
      const transferDataForMaspTesting = {
        ...transferData,
        source: shieldedInput
          ? "atest1v4ehgw36xaryysfsx5unvve4g5my2vjz89p52sjxxgenzd348yuyyv3hg3pnjs35g5unvde4ca36y5"
          : transparentAddress,
        target:
          "atest1v4ehgw36xaryysfsx5unvve4g5my2vjz89p52sjxxgenzd348yuyyv3hg3pnjs35g5unvde4ca36y5",
      };
      const hashAndBytes = await transfer.makeShieldedTransfer({
        ...transferDataForMaspTesting,
        shieldedTransaction,
      });
      hash = hashAndBytes.hash;
      bytes = hashAndBytes.bytes;
    } else {
      const hashAndBytes = await transfer.makeTransfer(transferData);
      hash = hashAndBytes.hash;
      bytes = hashAndBytes.bytes;
    }

    const { promise, timeoutId } = promiseWithTimeout<NewBlockEvents>(
      new Promise(async (resolve) => {
        console.log("broadcasting tx");
        await socketClient.broadcastTx(bytes);
        const events = await socketClient.subscribeNewBlock(hash);
        console.log(events);
        resolve(events);
      }),
      LEDGER_TRANSFER_TIMEOUT,
      `Async actions timed out when communicating with ledger after ${
        LEDGER_TRANSFER_TIMEOUT / 1000
      } seconds`
    );

    promise.catch((e) => {
      socketClient.disconnect();
      rejectWithValue(e);
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

const initialState: TransfersState = {
  transactions: {},
  isTransferSubmitting: false,
};

// create slice containing reducers and actions for transfer
const transfersSlice = createSlice({
  name: TRANSFERS_ACTIONS_BASE,
  initialState,
  reducers: {
    clearEvents: (state) => {
      state.events = undefined;
      state.isTransferSubmitting = false;
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
  },
});

const { actions, reducer } = transfersSlice;
export const { clearEvents } = actions;
export default reducer;
