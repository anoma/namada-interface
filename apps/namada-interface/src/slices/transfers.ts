import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { chains } from "@anoma/chains";
import { Account, TxWasm, Tokens, TokenType, Signer } from "@anoma/types";
import { RpcClient } from "@anoma/rpc";
import { fetchWasmCode, amountToMicro } from "@anoma/utils";

/* import { */
/*   createShieldedTransfer, */
/* } from "./shieldedTransfer"; */
/* import { updateShieldedBalances } from "./AccountsNew"; */
import {
  actions as notificationsActions,
  CreateToastPayload,
  ToastId,
  ToastType,
} from "slices/notifications";
import { fetchBalanceByToken } from "./balances";
import { getIntegration } from "services";

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
    [Toasts.TransferCompleted]: ({ gas }: TransferCompletedToastProps) => ({
      id: toastId,
      data: {
        title: "Transfer successful!",
        message: `Gas used: ${gas}`,
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

/* type ShieldedAddress = string; */
/**/
/* // data passed from the UI for a shielded transfer */
/* type ShieldedTransferData = TxTransferArgs & { */
/*   account: ShieldedAccount; */
/*   shieldedKeysAndPaymentAddress: ShieldedKeysAndPaymentAddress; */
/*   target: ShieldedAddress; */
/*   targetShieldedAddress: ShieldedAddress; */
/* }; */

type TransferHashAndBytes = {
  transferType: TransferType;
  transferHash: string;
  transferAsBytes: string;
};

type TransferData = {
  source: string;
  target: string;
  token: string;
  amount: number;
};

const revealPublicKey = async (
  account: Account,
  token: string,
  epoch: number,
  gasLimit = 10000000,
  feeAmount = 10000
): Promise<{ hash: string; bytes: string }> => {
  const integration = getIntegration(account.chainId);
  integration.detect();

  //TODO: We have to treat this as anoma Signer for now
  // so we can use signer methods
  const signer = integration.signer() as Signer;
  const txCode = await fetchWasmCode(TxWasm.RevealPK);

  const encodedTx = (await signer?.encodeRevealPk(account.address)) || "";

  const txProps = {
    token,
    epoch,
    feeAmount,
    gasLimit,
    txCode,
    signInner: false,
  };

  const { hash, bytes } =
    (await signer?.signTx(account.address, txProps, encodedTx)) || {};

  if (hash && bytes) {
    return {
      hash,
      bytes,
    };
  }

  throw Error("Invalid RevealPublicKey Transaction");
};

// TODO: Re-enable, and update this:
/* const createShieldedTransaction = async ( */
/*   chainId: string, */
/*   spendingKey: string | undefined, */
/*   paymentAddress: string, */
/*   // tokenValue: 1 ETC, 0.2 ETC, etc. the token value as the user entered it */
/*   // division by 1_000_000 should have not been performed yet */
/*   tokenValue: number, */
/*   tokenAddress: string */
/* ): Promise<Uint8Array> => { */
/*   const transferAmount = tokenValue * 1_000_000; */
/*   const shieldedTransaction = await createShieldedTransfer( */
/*     chainId, */
/*     transferAmount, */
/*     spendingKey, */
/*     paymentAddress, */
/*     tokenAddress */
/*   ); */
/*   return Promise.resolve(shieldedTransaction); */
/* }; */

// this creates the transfer that is being submitted to the ledger, if the transfer is shielded
// it will first create the shielded transfer that is included in the "parent" transfer
const createTransfer = async (
  epoch: number,
  sourceAccount: Account,
  transferData: TransferData,
  gasLimit = 100000,
  feeAmount = 1000
): Promise<TransferHashAndBytes> => {
  const { chainId, address } = sourceAccount;
  const { amount, target, token } = transferData;
  const txCode = await fetchWasmCode(TxWasm.Transfer);

  // Invoke extension integration
  const integration = getIntegration(chainId);
  integration.detect();
  //TODO: We have to treat this as anoma Signer for now
  // so we can use signer methods
  const signer = integration.signer() as Signer;
  const encodedTx =
    (await signer?.encodeTransfer({
      source: address,
      target,
      token,
      amount,
    })) || "";

  const txProps = {
    token,
    epoch,
    feeAmount,
    gasLimit,
    txCode,
    signInner: true,
  };

  const { hash, bytes } =
    (await signer?.signTx(address, txProps, encodedTx)) || {};

  if (hash && bytes) {
    return {
      transferType: TransferType.NonShielded,
      transferHash: hash,
      transferAsBytes: bytes,
    };
  } else {
    throw new Error("Invalid transaction!");
  }
  /* const transfer = await new Transfer(txCode).init(); */
  // ============================================================================
  // TODO:
  //
  // The following must be updated to be supported by the extension!
  // Any access to private keys need to be accessed only within the extension.
  // Spending and Viewing keys should be accessible by the interface, and the
  // hard-coded private key below must be removed. This can be replaced with
  // a private signing key within the extension:
  // ============================================================================
  //
  //
  /* const { target } = transferData; */
  /* if (isShieldedAddress(target) || isShieldedAccount(sourceAccount)) { */
  /*   // if the transfer source is shielded */
  /*   const spendingKey = */
  /*     sourceAccount.shieldedKeysAndPaymentAddress?.spendingKey; */
  /**/
  /*   // TODO add types to this */
  /*   // "NAM", "BTC", ... */
  /*   const tokenType = sourceAccount.tokenType; */
  /*   const tokenAddress = TRANSFER_CONFIGURATION.tokenAddresses[tokenType]; */
  /*   // if this is a shielding transfer, there is no shieldedKeysAndPaymentAddress */
  /*   // in that case we just pass undefined */
  /*   const shieldedTransaction = await createShieldedTransaction( */
  /*     chainId, */
  /*     spendingKey, */
  /*     transferData.target, */
  /*     transferData.amount, */
  /*     tokenAddress */
  /*   ); */
  /**/
  /*   // TODO get rid of these hacks, restructure the whole data model representing the transfer */
  /*   // we set the source and target addresses to masp (shielded -> shielded) */
  /*   const source = sourceAccount.shieldedKeysAndPaymentAddress */
  /*     ? MASP_ADDRESS */
  /*     : sourceAccount.establishedAddress || ""; // TODO: Fix data model so this "" isn't needed */
  /**/
  /*   const maspAddressOrEstablishedAddress = isShieldedAddress(target) */
  /*     ? MASP_ADDRESS */
  /*     : target; // TODO: Fix data model so this "" isn't needed */
  /**/
  /*   // TODO remove this placeholder */
  /*   if (sourceAccount.shieldedKeysAndPaymentAddress) { */
  /*     transferData.privateKey = */
  /*       "cf0805f7675f3a17db1769f12541449d53935f50dab8590044f8a4cd3454ec4f"; */
  /*   } */
  /**/
  /*   const transferDataWithMaspAddress = { */
  /*     ...transferData, */
  /*     source: source, */
  /*     target: maspAddressOrEstablishedAddress, */
  /*   }; */
  /**/
  /*   // generate the transfer that contains the shielded transaction inside of it */
  /*   const hashAndBytes = await transfer.makeShieldedTransfer({ */
  /*     ...transferDataWithMaspAddress, */
  /*     shieldedTransaction, */
  /*   }); */
  /**/
  /*   return { */
  /*     transferType: TransferType.Shielded, */
  /*     transferHash: hashAndBytes.hash, */
  /*     transferAsBytes: hashAndBytes.bytes, */
  /*   }; */
  /* } else { */

  /* } */
};

export const actionTypes = {
  SUBMIT_TRANSFER_ACTION_TYPE: `${TRANSFERS_ACTIONS_BASE}/${TransfersThunkActions.SubmitTransferTransaction}`,
};
// this takes care of 4 different variations of transfers:
// shielded -> shielded
// transparent -> shielded
// shielded -> transparent
// transparent -> transparent
export const submitTransferTransaction = createAsyncThunk(
  actionTypes.SUBMIT_TRANSFER_ACTION_TYPE,
  async (
    txTransferArgs: WithNotification<TxTransferArgs>,
    { dispatch, rejectWithValue, requestId }
  ) => {
    const {
      account,
      target,
      token: tokenType,
      amount,
      memo = "",
      // TODO: What are reasonable defaults for this?
      feeAmount = 10000,
      // TODO: What are reasonable defaults for this?
      gasLimit = 10000000,
      faucet,
      chainId,
      notify,
    } = txTransferArgs;

    const { address } = account;
    const source = faucet || address;
    const { rpc } = chains[chainId];

    const rpcClient = new RpcClient(rpc);

    notify &&
      dispatch(
        notificationsActions.createToast(
          getToast(`${requestId}-pending`, Toasts.TransferStarted)()
        )
      );

    const token = Tokens[tokenType]; // TODO refactor, no need for separate Tokens and tokenType
    const transferData: TransferData = {
      source,
      target,
      token: token.address || "",
      amount: amountToMicro(amount),
    };

    try {
      const epoch = await rpcClient.queryEpoch();
      const revealPk = await revealPublicKey(
        account,
        token.address || "",
        epoch
      );
      await rpcClient.broadcastTxSync(revealPk.bytes);
      await rpcClient.getAppliedTx(revealPk.hash);
    } catch (e) {
      return rejectWithValue(e);
    }

    const epoch = await rpcClient.queryEpoch();
    const createdTransfer = await createTransfer(
      epoch,
      account,
      transferData,
      gasLimit,
      feeAmount
    );

    const { transferHash, transferAsBytes, transferType } = createdTransfer;
    try {
      await rpcClient.broadcastTxSync(transferAsBytes);
      await rpcClient.getAppliedTx(transferHash);
    } catch (e) {
      return rejectWithValue(e);
    }

    dispatch(fetchBalanceByToken({ token: tokenType, account }));

    notify &&
      dispatch(
        notificationsActions.createToast(
          // TODO: Remove the following if we decided we do not want to return gas used
          getToast(
            `${requestId}-fullfilled`,
            Toasts.TransferCompleted
          )({ gas: 100000 })
        )
      );

    return {
      faucet,
      transaction: {
        chainId,
        source,
        target,
        appliedHash: transferHash,
        tokenType,
        amount,
        memo,
        gas: 100000,
        height: 2,
        timestamp: new Date().getTime(),
        type: transferType,
      },
    };
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

    builder.addCase(
      submitTransferTransaction.fulfilled,
      (
        state,
        action: PayloadAction<{
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
