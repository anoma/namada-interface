import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";

import { Account, Tokens, TokenType, Signer } from "@namada/types";
import { getIntegration } from "@namada/hooks";

import { RootState } from "store";
const TRANSFERS_ACTIONS_BASE = "transfers";

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
  isBridgeTransferSubmitting: boolean;
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
  SubmitBridgeTransferTransaction = "submitBridgeTransferTransaction",
}

type WithNotification<T> = T & { notify?: boolean };

type TxArgs = {
  chainId: string;
  account: Account;
  token: TokenType;
  target: string;
  amount: BigNumber;
  memo?: string;
  feeAmount?: BigNumber;
  gasLimit?: BigNumber;
};

type TxTransferArgs = TxArgs & {
  faucet?: string;
};

type TxIbcTransferArgs = TxArgs & {
  chainId: string;
  channelId: string;
  portId: string;
};

type TxBridgeTransferArgs = TxArgs & {
  chainId: string;
  target: string;
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
  async (txTransferArgs, { getState }) => {
    const { chainId } = getState().settings;
    const integration = getIntegration(chainId);
    const signer = integration.signer() as Signer;

    const {
      account: { publicKey, address },
      amount,
      faucet,
      target,
      token,
    } = txTransferArgs;

    const transferArgs = {
      tx: {
        token: Tokens.NAM.address || "",
        feeAmount: new BigNumber(0),
        gasLimit: new BigNumber(0),
        chainId,
        publicKey: publicKey,
        signer: faucet ? target : undefined,
      },
      source: faucet || address,
      target,
      token: Tokens[token].address || Tokens.NAM.address || "",
      amount,
      nativeToken: Tokens.NAM.address || "",
    };

    await signer.submitTransfer(transferArgs, txTransferArgs.account.type);
  }
);

export const submitIbcTransferTransaction = createAsyncThunk<
  void,
  WithNotification<TxIbcTransferArgs>,
  { state: RootState }
>(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitIbcTransferTransaction}`,
  async (txIbcTransferArgs, { getState }) => {
    const { chainId } = getState().settings;
    const integration = getIntegration(chainId);

    await integration.submitBridgeTransfer({
      ibcProps: {
        tx: {
          token: Tokens.NAM.address || "",
          feeAmount: new BigNumber(0),
          gasLimit: new BigNumber(0),
          chainId,
        },
        source: txIbcTransferArgs.account.address,
        receiver: txIbcTransferArgs.target,
        token: Tokens.NAM.address || "",
        amount: txIbcTransferArgs.amount,
        portId: txIbcTransferArgs.portId,
        channelId: txIbcTransferArgs.channelId,
      },
    });
  }
);

export const submitBridgeTransferTransaction = createAsyncThunk<
  void,
  WithNotification<TxBridgeTransferArgs>,
  { state: RootState }
>(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitBridgeTransferTransaction}`,
  async (txBridgeTransferArgs, { getState }) => {
    const { chainId } = getState().settings;
    const integration = getIntegration(chainId);

    await integration.submitBridgeTransfer({
      // TODO: tx (below) is *not* required for Keplr, but are required for this type.
      // This should be accounted for in the type declarations and integration.
      bridgeProps: {
        tx: {
          token: Tokens.NAM.address || "",
          feeAmount: new BigNumber(0),
          gasLimit: new BigNumber(0),
          chainId,
        },
        source: txBridgeTransferArgs.account.address,
        target: txBridgeTransferArgs.target,
        token: txBridgeTransferArgs.token,
        amount: txBridgeTransferArgs.amount,
      },
    });
  }
);

const initialState: TransfersState = {
  transactions: [],
  isTransferSubmitting: false,
  isBridgeTransferSubmitting: false,
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
      state.isBridgeTransferSubmitting = true;
      state.transferError = undefined;
      state.events = undefined;
    });

    builder.addCase(submitIbcTransferTransaction.rejected, (state, action) => {
      const { error, payload } = action;
      state.isBridgeTransferSubmitting = false;
      state.transferError = (payload as string) || error.message;
      state.events = undefined;
    });

    builder.addCase(submitBridgeTransferTransaction.pending, (state) => {
      state.isBridgeTransferSubmitting = true;
      state.transferError = undefined;
      state.events = undefined;
    });

    builder.addCase(
      submitBridgeTransferTransaction.rejected,
      (state, action) => {
        const { error, payload } = action;
        state.isBridgeTransferSubmitting = false;
        state.transferError = (payload as string) || error.message;
        state.events = undefined;
      }
    );
  },
});

const { actions, reducer } = transfersSlice;
export const { clearEvents, clearErrors } = actions;
export default reducer;
