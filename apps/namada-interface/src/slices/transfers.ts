import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { Account, TxWasm, Tokens, TokenType, Signer } from "@anoma/types";
import { amountToMicro, fetchWasmCode } from "@anoma/utils";
import {
  actions as notificationsActions,
  CreateToastPayload,
  ToastId,
  ToastType,
} from "slices/notifications";
import { getIntegration } from "services";
import { RootState } from "store";

enum Toasts {
  TransferStarted,
  TransferCompleted,
}

type TransferCompletedToastProps = { gas: number };
type GetToastProps = TransferCompletedToastProps | void;

const getToast = (
  toastId: ToastId,
  toast: Toasts
): ((props: GetToastProps) => CreateToastPayload) => {
  const toasts = {
    [Toasts.TransferStarted]: () => ({
      id: toastId,
      data: {
        title: "Transfer started!",
        message: "",
        type: "info" as ToastType,
      },
    }),
    [Toasts.TransferCompleted]: () => ({
      id: toastId,
      data: {
        title: "Transfer successful!",
        message: "",
        type: "success" as ToastType,
      },
    }),
  };

  return toasts[toast] as (props: GetToastProps) => CreateToastPayload;
};

const TRANSFERS_ACTIONS_BASE = "transfers";
/* const MASP_ADDRESS = TRANSFER_CONFIGURATION.maspAddress; */

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
  memo?: string;
  timestamp: number;
  ibcTransfer?: IBCTransferAttributes;
};

export type TransfersState = {
  transactions: TransferTransaction[];
  isTransferSubmitting: boolean;
  isIbcTransferSubmitting: boolean;
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
  SubmitIbcTransferTransaction = "submitIbcTransferTransaction",
}

type WithNotification<T> = T & { notify?: boolean };

type TxArgs = {
  chainId: string;
  account: Account;
  token: TokenType;
  target: string;
  amount: number;
  memo?: string;
  feeAmount?: number;
  gasLimit?: number;
};

type TxTransferArgs = TxArgs & {
  faucet?: string;
};

type TxIbcTransferArgs = TxArgs & {
  chainId: string;
  channelId: string;
  portId: string;
};

export const actionTypes = {
  SUBMIT_TRANSFER_ACTION_TYPE: `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitTransferTransaction}`,
};
// this takes care of 4 different variations of transfers:
// shielded -> shielded
// transparent -> shielded
// shielded -> transparent
// transparent -> transparent
export const submitTransferTransaction = createAsyncThunk<
  void,
  TxTransferArgs,
  { state: RootState }
>(
  actionTypes.SUBMIT_TRANSFER_ACTION_TYPE,
  async (txTransferArgs, { getState, dispatch, requestId }) => {
    const { chainId } = getState().settings;
    const integration = getIntegration(chainId);
    const signer = integration.signer() as Signer;

    dispatch(
      notificationsActions.createToast(
        getToast(`${requestId}-pending`, Toasts.TransferStarted)()
      )
    );

    // TODO: because submitting transfer is async we have to keep track of the
    // transfer id to know how when and how to handle it when it's completed.
    await signer.submitTransfer({
      tx: {
        token: Tokens.NAM.address || "",
        feeAmount: 0,
        gasLimit: 0,
        txCode: await fetchWasmCode(TxWasm.RevealPK),
      },
      source: txTransferArgs.account.address,
      target: txTransferArgs.target,
      token: Tokens.NAM.address || "",
      amount: amountToMicro(txTransferArgs.amount),
      nativeToken: Tokens.NAM.address || "",
      txCode: await fetchWasmCode(TxWasm.Transfer),
    });

    dispatch(
      notificationsActions.createToast(
        getToast(`${requestId}-fullfilled`, Toasts.TransferCompleted)()
      )
    );
  }
);

// TODO: This needs to be revisited and tested
export const submitIbcTransferTransaction = createAsyncThunk<
  void,
  WithNotification<TxIbcTransferArgs>,
  { state: RootState }
>(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitIbcTransferTransaction}`,
  async (txIbcTransferArgs, { getState, dispatch, requestId }) => {
    const { chainId } = getState().settings;
    const integration = getIntegration(chainId);
    const signer = integration.signer() as Signer;

    dispatch(
      notificationsActions.createToast(
        getToast(`${requestId}-pending`, Toasts.TransferStarted)()
      )
    );

    await signer.submitIbcTransfer({
      tx: {
        token: Tokens.NAM.address || "",
        feeAmount: 0,
        gasLimit: 0,
        txCode: await fetchWasmCode(TxWasm.RevealPK),
      },
      source: txIbcTransferArgs.account.address,
      receiver: txIbcTransferArgs.target,
      token: Tokens.NAM.address || "",
      amount: amountToMicro(txIbcTransferArgs.amount),
      portId: txIbcTransferArgs.portId,
      channelId: txIbcTransferArgs.channelId,
      txCode: await fetchWasmCode(TxWasm.IBC),
    });

    dispatch(
      notificationsActions.createToast(
        getToast(`${requestId}-fullfilled`, Toasts.TransferCompleted)()
      )
    );
  }
);

const initialState: TransfersState = {
  transactions: [],
  isTransferSubmitting: false,
  isIbcTransferSubmitting: false,
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
  },
});

const { actions, reducer } = transfersSlice;
export const { clearEvents, clearErrors } = actions;
export default reducer;
