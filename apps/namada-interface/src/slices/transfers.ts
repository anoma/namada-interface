import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { chains } from "@anoma/chains";
import { Account, TxWasm, Tokens, TokenType, Signer } from "@anoma/types";
import { RpcClient } from "@anoma/rpc";
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
  WithNotification<TxTransferArgs>,
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
export const submitIbcTransferTransaction = createAsyncThunk(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitIbcTransferTransaction}`,
  async (
    {
      account,
      token: tokenType,
      target,
      amount,
      memo = "",
      // TODO: What are reasonable defaults for this?
      feeAmount = 1000,
      // TODO: What are reasonable defaults for this?
      gasLimit = 1000000,
      channelId,
      portId,
      chainId,
    }: TxIbcTransferArgs,
    { rejectWithValue }
  ) => {
    const { address: source = "" } = account;
    const { rpc } = chains[chainId];

    const rpcClient = new RpcClient(rpc);

    let epoch: number;
    try {
      epoch = await rpcClient.queryEpoch();
    } catch (e) {
      return rejectWithValue(e);
    }

    const token = Tokens[tokenType];
    const tokenAddress = token?.address ?? "";
    const txCode = await fetchWasmCode(TxWasm.IBC);

    const integration = getIntegration(chainId);
    integration.detect();
    //TODO: We have to treat this as anoma Signer for now
    // so we can use signer methods
    const signer = integration.signer() as Signer;
    const encodedTx =
      (await signer?.encodeIbcTransfer({
        sourcePort: portId,
        sourceChannel: channelId,
        sender: source,
        receiver: target,
        token: tokenAddress,
        amount,
      })) || "";

    const txProps = {
      token: tokenAddress,
      epoch,
      feeAmount,
      gasLimit,
      txCode,
      signInner: true,
    };

    const { hash, bytes } =
      (await signer?.signTx(source, txProps, encodedTx)) || {};

    if (!hash || !bytes) {
      throw new Error("Invalid transaction!");
    }

    try {
      await rpcClient.broadcastTxSync(bytes);
      await rpcClient.getAppliedTx(hash);
    } catch (e) {
      return rejectWithValue(e);
    }

    return {
      chainId,
      appliedHash: hash,
      tokenType,
      source,
      target,
      amount,
      memo,
      shielded: false,
      gas: 1000000,
      height: 0,
      timestamp: new Date().getTime(),
      type: TransferType.IBC,
      // TODO: Remove unused properties below
      ibcTransfer: {
        chainId,
        sourceChannel: channelId,
        sourcePort: portId,
        destinationChannel: channelId,
        destinationPort: portId,
        timeoutHeight: 0,
        timeoutTimestamp: 0,
      },
    };
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
