import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { history, TopLevelRouteGenerator } from "App";
import { Config } from "config";
import { FAUCET_ADDRESS, Tokens, TokenType, TxResponse } from "constants/";
import { RpcClient, SocketClient, Transfer } from "lib";
import { NewBlockEvents } from "lib/rpc/types";
import { amountFromMicro, promiseWithTimeout } from "utils/helpers";
import {
  DerivedAccount,
  ShieldedAccount,
  fetchBalanceByAccount,
  ShieldedKeysAndPaymentAddress,
  isShieldedAddress,
  isShieldedAccount,
} from "./accounts";

import { createShieldedTransfer } from "./shieldedTransfer";
import { updateShieldedBalances } from "./accountsNew";

const TRANSFERS_ACTIONS_BASE = "transfers";
const LEDGER_TRANSFER_TIMEOUT = 10000;
const MASP_ADDRESS =
  "atest1v4ehgw36xaryysfsx5unvve4g5my2vjz89p52sjxxgenzd348yuyyv3hg3pnjs35g5unvde4ca36y5";

export type TransferTransaction = {
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
};

export type TransfersState = {
  transactions: TransferTransaction[];
  isTransferSubmitting: boolean;
  transferError?: string;
  events?: TransferEvents;
};

export enum TransferType {
  IBC = "IBC",
  Shielded = "Shielded",
  NonShielded = "Non-Shielded", // TODO: Rename to Transparent
}

type TransferEvents = {
  gas: number;
  appliedHash: string;
};

enum TransfersThunkActions {
  SubmitTransferTransaction = "submitTransferTransaction",
}

const { network, wsNetwork } = new Config();
const rpcClient = new RpcClient(network);
const socketClient = new SocketClient(wsNetwork);

// this data is being passed from the UI
type TxTransferArgs = {
  account: DerivedAccount | ShieldedAccount;
  target: string;
  amount: number;
  memo: string;
  useFaucet?: boolean;
};

type ShieldedAddress = string;

// data passed from the UI for a shielded transfer
type ShieldedTransferData = TxTransferArgs & {
  account: ShieldedAccount;
  shieldedKeysAndPaymentAddress: ShieldedKeysAndPaymentAddress;
  target: ShieldedAddress;
  targetShieldedAddress: ShieldedAddress;
};

type TransferHashAndBytes = {
  transferType: TransferType;
  transferHash: string;
  transferAsBytes: Uint8Array;
};

type TransferData = {
  source: string;
  target: string;
  token: string;
  amount: number;
  epoch: number;
  privateKey: string;
};

const createShieldedTransaction = async (
  spendingKey: string | undefined,
  paymentAddress: string,
  tokenValue: number // 1 ETC, 0.2 ETC, etc. the token value as the user entered it, division by 1_000_000 should have not been performed yet
): Promise<Uint8Array> => {
  const transferAmount = tokenValue * 1_000_000;
  const shieldedTransaction = await createShieldedTransfer(
    transferAmount,
    spendingKey,
    paymentAddress
  );
  return Promise.resolve(shieldedTransaction);
};

// this creates the transfer that is being submitted to the ledger, if the transfer is shielded
// it will first create the shielded transfer that is included in the "parent" transfer
const createTransfer = async (
  sourceAccount: DerivedAccount | ShieldedAccount,
  transferData: TransferData
): Promise<TransferHashAndBytes> => {
  const transfer = await new Transfer().init();
  const { target } = transferData;

  if (isShieldedAddress(target) || isShieldedAccount(sourceAccount)) {
    // if the transfer source is shielded
    const spendingKey =
      sourceAccount.shieldedKeysAndPaymentAddress?.spendingKey;

    // if this is a shielding transfer, there is no shieldedKeysAndPaymentAddress
    // in that case we just pass undefined
    const shieldedTransaction = await createShieldedTransaction(
      spendingKey,
      transferData.target,
      transferData.amount
    );

    // TODO get rid of these hacks, restructure the whole data model representing the transfer
    // we set the source and target addresses to masp (shielded -> shielded)
    const source = sourceAccount.shieldedKeysAndPaymentAddress
      ? MASP_ADDRESS
      : sourceAccount.establishedAddress || ""; // we know its there but due to bad data model ts cannot know it, refactor TODO

    const maspAddressOrEstablishedAddress = isShieldedAddress(target)
      ? MASP_ADDRESS
      : target; // we know its there but due to bad data model ts cannot know it, refactor TODO

    // TODO remote this placeholder
    if (sourceAccount.shieldedKeysAndPaymentAddress) {
      transferData.privateKey =
        "cf0805f7675f3a17db1769f12541449d53935f50dab8590044f8a4cd3454ec4f";
    }

    const transferDataWithMaspAddress = {
      ...transferData,
      source: source,
      target: maspAddressOrEstablishedAddress,
    };

    // generate the transfer that contains the shielded transaction inside of it
    const hashAndBytes = await transfer.makeShieldedTransfer({
      ...transferDataWithMaspAddress,
      shieldedTransaction,
    });

    return {
      transferType: TransferType.Shielded,
      transferHash: hashAndBytes.hash,
      transferAsBytes: hashAndBytes.bytes,
    };
  } else {
    const hashAndBytes = await transfer.makeTransfer(transferData);
    return {
      transferType: TransferType.NonShielded,
      transferHash: hashAndBytes.hash,
      transferAsBytes: hashAndBytes.bytes,
    };
  }
};

// this takes care of 4 different variations of transfers:
// shielded -> shielded
// transparent -> shielded
// shielded -> transparent
// transparent -> transparent
export const submitTransferTransaction = createAsyncThunk(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitTransferTransaction}`,
  async (
    txTransferArgs: TxTransferArgs | ShieldedTransferData,
    { dispatch, rejectWithValue, getState }
  ) => {
    const { account, target, amount, memo, useFaucet } = txTransferArgs;
    const {
      id,
      establishedAddress = "",
      tokenType,
      signingKey: privateKey,
    } = account;
    const source = useFaucet ? FAUCET_ADDRESS : establishedAddress;
    const epoch = await rpcClient.queryEpoch();
    const token = Tokens[tokenType]; // TODO refactor, no need for separate Tokens and tokenType
    const transferData: TransferData = {
      source,
      target,
      token: token.address || "",
      amount,
      epoch,
      privateKey,
    };
    const createdTransfer = await createTransfer(account, transferData);
    const { transferHash, transferAsBytes, transferType } = createdTransfer;
    const { promise, timeoutId } = promiseWithTimeout<NewBlockEvents>(
      new Promise(async (resolve) => {
        await socketClient.broadcastTx(transferAsBytes);
        const events = await socketClient.subscribeNewBlock(transferHash);
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
    dispatch(updateShieldedBalances());

    // TODO pass this as a callback from consumer as we might need different behaviors
    history.push(
      TopLevelRouteGenerator.createRouteForTokenByTokenId(
        txTransferArgs.account.id
      )
    );

    return {
      id,
      useFaucet,
      transaction: {
        source,
        target,
        appliedHash,
        tokenType,
        amount,
        memo,
        gas,
        height,
        timestamp: new Date().getTime(),
        type: transferType,
      },
    };
  }
);

const initialState: TransfersState = {
  transactions: [],
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
  },
});

const { actions, reducer } = transfersSlice;
export const { clearEvents } = actions;
export default reducer;
