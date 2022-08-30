import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  RpcConfig,
  RpcClient,
  SocketClient,
  NewBlockEvents,
  TxResponse,
  IbcTxResponse,
} from "@anoma/rpc";
import { Transfer, IBCTransfer, TxWasm, Tokens, TokenType } from "@anoma/tx";
import {
  amountFromMicro,
  promiseWithTimeout,
  fetchWasmCode,
} from "@anoma/utils";

import Config from "config";
import {
  DerivedAccount,
  ShieldedAccount,
  fetchBalanceByAccount,
  ShieldedKeysAndPaymentAddress,
  isShieldedAddress,
  isShieldedAccount,
} from "./accounts";
import {
  createShieldedTransfer,
  TRANSFER_CONFIGURATION,
} from "./shieldedTransfer";
import { updateShieldedBalances } from "./AccountsNew";

const TRANSFERS_ACTIONS_BASE = "transfers";
const LEDGER_TRANSFER_TIMEOUT = 20000;
const IBC_TRANSFER_TIMEOUT = 15000;
const MASP_ADDRESS = TRANSFER_CONFIGURATION.maspAddress;

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

type TxArgs = {
  chainId: string;
  account: DerivedAccount | ShieldedAccount;
  token: TokenType;
  target: string;
  amount: number;
  memo?: string;
  feeAmount?: number;
};

type TxTransferArgs = TxArgs & {
  faucet?: string;
};

type TxIbcTransferArgs = TxArgs & {
  chainId: string;
  channelId: string;
  portId: string;
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
  chainId: string,
  spendingKey: string | undefined,
  paymentAddress: string,
  // tokenValue: 1 ETC, 0.2 ETC, etc. the token value as the user entered it
  // division by 1_000_000 should have not been performed yet
  tokenValue: number,
  tokenAddress: string
): Promise<Uint8Array> => {
  const transferAmount = tokenValue * 1_000_000;
  const shieldedTransaction = await createShieldedTransfer(
    chainId,
    transferAmount,
    spendingKey,
    paymentAddress,
    tokenAddress
  );
  return Promise.resolve(shieldedTransaction);
};

// this creates the transfer that is being submitted to the ledger, if the transfer is shielded
// it will first create the shielded transfer that is included in the "parent" transfer
const createTransfer = async (
  chainId: string,
  sourceAccount: DerivedAccount | ShieldedAccount,
  transferData: TransferData
): Promise<TransferHashAndBytes> => {
  const txCode = await fetchWasmCode(TxWasm.Transfer);
  const transfer = await new Transfer(txCode).init();
  const { target } = transferData;
  if (isShieldedAddress(target) || isShieldedAccount(sourceAccount)) {
    // if the transfer source is shielded
    const spendingKey =
      sourceAccount.shieldedKeysAndPaymentAddress?.spendingKey;

    // TODO add types to this
    // "NAM", "BTC", ...
    const tokenType = sourceAccount.tokenType;
    const tokenAddress = TRANSFER_CONFIGURATION.tokenAddresses[tokenType];
    // if this is a shielding transfer, there is no shieldedKeysAndPaymentAddress
    // in that case we just pass undefined
    const shieldedTransaction = await createShieldedTransaction(
      chainId,
      spendingKey,
      transferData.target,
      transferData.amount,
      tokenAddress
    );

    // TODO get rid of these hacks, restructure the whole data model representing the transfer
    // we set the source and target addresses to masp (shielded -> shielded)
    const source = sourceAccount.shieldedKeysAndPaymentAddress
      ? MASP_ADDRESS
      : sourceAccount.establishedAddress || ""; // TODO: Fix data model so this "" isn't needed

    const maspAddressOrEstablishedAddress = isShieldedAddress(target)
      ? MASP_ADDRESS
      : target; // TODO: Fix data model so this "" isn't needed

    // TODO remove this placeholder
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
// transparent -> transparente
export const submitTransferTransaction = createAsyncThunk(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitTransferTransaction}`,
  async (
    txTransferArgs: TxTransferArgs | ShieldedTransferData,
    { dispatch, rejectWithValue }
  ) => {
    const {
      account,
      target,
      token: tokenType,
      amount,
      memo = "",
      faucet,
      chainId,
    } = txTransferArgs;
    const { id, establishedAddress = "", signingKey: privateKey } = account;

    const source = faucet || establishedAddress;

    const chainConfig = Config.chain[chainId];

    const { network } = chainConfig;

    const rpcClient = new RpcClient(network);
    const socketClient = new SocketClient({
      ...network,
      protocol: network.wsProtocol,
    });

    let epoch: number;
    try {
      epoch = await rpcClient.queryEpoch();
    } catch (e) {
      return rejectWithValue(e);
    }

    const token = Tokens[tokenType]; // TODO refactor, no need for separate Tokens and tokenType
    const transferData: TransferData = {
      source,
      target,
      token: token.address || "",
      amount,
      epoch,
      privateKey,
    };

    const createdTransfer = await createTransfer(
      chainId,
      account,
      transferData
    );

    const { transferHash, transferAsBytes, transferType } = createdTransfer;
    const { promise, timeoutId } = promiseWithTimeout<NewBlockEvents>(
      new Promise(async (resolve) => {
        await socketClient.broadcastTx(transferAsBytes);
        const events = await socketClient.subscribeNewBlock(transferHash);
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
    dispatch(updateShieldedBalances());

    // TODO pass this as a callback from consumer as we might need different behaviors
    // history.push(
    //   TopLevelRouteGenerator.createRouteForTokenByTokenId(
    //     txTransferArgs.account.id
    //   )
    // );

    return {
      id,
      faucet,
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
        type: transferType,
      },
    };
  }
);

export const submitIbcTransferTransaction = createAsyncThunk(
  `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitIbcTransferTransaction}`,
  async (
    {
      account,
      token: tokenType,
      target,
      amount,
      memo = "",
      feeAmount = 0,
      channelId,
      portId,
      chainId,
    }: TxIbcTransferArgs,
    { rejectWithValue }
  ) => {
    const { establishedAddress: source = "", signingKey: privateKey } = account;
    const chainConfig = Config.chain[chainId] || {};
    const { url, port, protocol, wsProtocol } = chainConfig.network;
    const rpcConfig = new RpcConfig(url, port, protocol, wsProtocol);
    const rpcClient = new RpcClient(rpcConfig.network);
    const socketClient = new SocketClient(rpcConfig.wsNetwork);

    let epoch: number;
    try {
      epoch = await rpcClient.queryEpoch();
    } catch (e) {
      return rejectWithValue(e);
    }

    const txWasm = await fetchWasmCode(TxWasm.IBC);
    const transfer = await new IBCTransfer(txWasm).init();
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

    builder.addCase(
      submitTransferTransaction.fulfilled,
      (
        state,
        action: PayloadAction<{
          id: string;
          faucet: string | undefined;
          transaction: TransferTransaction;
        }>
      ) => {
        const { faucet, transaction } = action.payload;
        const { gas, appliedHash } = transaction;

        state.isTransferSubmitting = false;
        state.transferError = undefined;

        state.events = !faucet
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
