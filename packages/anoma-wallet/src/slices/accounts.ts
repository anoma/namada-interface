import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Config } from "config";
import { Tokens, TokenType, TxResponse } from "constants/";
import { Account, RpcClient, SocketClient } from "lib";
import { NewBlockEvents } from "lib/rpc/types";
import { promiseWithTimeout, stringToHash } from "utils/helpers";
import { submitTransferTransaction } from "./transfers";
import { addAccountReducersToBuilder } from "./accountsNew/reducers";
import { ShieldedAccountType } from "@anoma/masp-web";

export type InitialAccount = {
  alias: string;
  tokenType: TokenType;
  address: string;
  publicKey: string;
  signingKey: string;
  establishedAddress?: string;
  zip32Address?: string;
  isShielded?: boolean;
};

export type DerivedAccount = InitialAccount & {
  id: string;
  balance: number;
  isInitializing?: boolean;
  accountInitializationError?: string;
  shieldedKeysAndPaymentAddress?: ShieldedKeysAndPaymentAddress;
};

// this is what is unique only to the shielded "Accounts"
// alias is not needed as the whole account is in hash map under the alias
export type ShieldedKeysAndPaymentAddress = {
  spendingKey: string;
  viewingKey: string;
  paymentAddress: string;
};

export type ShieldedAccount = DerivedAccount & {
  shieldedKeysAndPaymentAddress: ShieldedKeysAndPaymentAddress;
};

// type predicate to figure out if the account is shielded or transparent
export const isShieldedAccount = (
  account: DerivedAccount | ShieldedAccount
): account is ShieldedAccount => {
  return (
    (account as ShieldedAccount).shieldedKeysAndPaymentAddress !== undefined
  );
};

export const isShieldedAddress = (address: string): boolean => {
  return address.startsWith("patest");
};

type DerivedAccounts = {
  [id: string]: DerivedAccount;
};

type ShieldedAccounts = {
  [id: string]: ShieldedAccount;
};

export type AccountsState = {
  isAddingAccountInReduxState?: boolean;
  derived: DerivedAccounts;
  shieldedAccounts: ShieldedAccounts;
};

const ACCOUNTS_ACTIONS_BASE = "accounts";
const { url } = new Config().network;

enum AccountThunkActions {
  FetchBalanceByAccount = "fetchBalanceByAccount",
  SubmitInitAccountTransaction = "submitInitAccountTransaction",
}

const { network, wsNetwork } = new Config();
const rpcClient = new RpcClient(network);
const socketClient = new SocketClient(wsNetwork);

const LEDGER_INIT_ACCOUNT_TIMEOUT = 12000;

export const fetchBalanceByAccount = createAsyncThunk(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountThunkActions.FetchBalanceByAccount}`,
  async (account: DerivedAccount) => {
    const { id, establishedAddress, tokenType } = account;
    const { address: tokenAddress = "" } = Tokens[tokenType];
    const balance = await rpcClient.queryBalance(
      tokenAddress,
      establishedAddress
    );
    return {
      id,
      balance: balance > 0 ? balance : 0,
    };
  }
);

export const submitInitAccountTransaction = createAsyncThunk(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountThunkActions.SubmitInitAccountTransaction}`,
  async (account: DerivedAccount, { dispatch, rejectWithValue }) => {
    const { signingKey: privateKey, tokenType } = account;

    const epoch = await rpcClient.queryEpoch();
    const anomaAccount = await new Account().init();
    const { hash, bytes } = await anomaAccount.initialize({
      token: Tokens[tokenType].address,
      privateKey,
      epoch,
    });

    const { promise, timeoutId } = promiseWithTimeout<NewBlockEvents>(
      new Promise(async (resolve) => {
        await socketClient.broadcastTx(bytes);
        const events = await socketClient.subscribeNewBlock(hash);
        resolve(events);
      }),
      LEDGER_INIT_ACCOUNT_TIMEOUT,
      `Async actions timed out when communicating with ledger after ${
        LEDGER_INIT_ACCOUNT_TIMEOUT / 1000
      } seconds`
    );

    promise.catch((e) => {
      socketClient.disconnect();
      rejectWithValue(e);
    });

    const events = await promise;
    clearTimeout(timeoutId);
    socketClient.disconnect();

    const initializedAccounts = events[TxResponse.InitializedAccounts];
    const establishedAddress = initializedAccounts
      .map((account: string) => JSON.parse(account))
      .find((account: string[]) => account.length > 0)[0];

    const initializedAccount = {
      ...account,
      balance: 0,
      establishedAddress,
    };

    if (url.match(/testnet|localhost/)) {
      dispatch(
        submitTransferTransaction({
          account: initializedAccount,
          target: establishedAddress || "",
          amount: 1000,
          memo: "Initial funds",
          useFaucet: true,
        })
      );
    }

    return initializedAccount;
  }
);

// todo these should likely be just one
const initialState: AccountsState = {
  derived: {},
  shieldedAccounts: {},
};

const accountsSlice = createSlice({
  name: ACCOUNTS_ACTIONS_BASE,
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<InitialAccount>) => {
      const initialAccount = action.payload;
      const { alias } = initialAccount;

      const id = stringToHash(alias);

      state.derived = {
        ...state.derived,
        [id]: {
          id: id,
          balance: 0,
          ...initialAccount,
        },
      };
    },
    setEstablishedAddress: (
      state,
      action: PayloadAction<{
        alias: string;
        establishedAddress: string;
      }>
    ) => {
      const { alias, establishedAddress } = action.payload;

      const { id } =
        Object.values(state.derived).find(
          (account) => account.alias === alias
        ) || {};

      if (id) {
        state.derived[id] = {
          ...state.derived[id],
          establishedAddress,
        };
      }
    },
    setBalance: (
      state,
      action: PayloadAction<{ id: string; balance: number }>
    ) => {
      const { id, balance } = action.payload;

      state.derived[id] = {
        ...state.derived[id],
        balance,
      };
    },
    setZip32Address: (
      state,
      action: PayloadAction<{
        id: string;
        zip32Address: string;
      }>
    ) => {
      const { id, zip32Address } = action.payload;

      state.derived[id] = {
        ...state.derived[id],
        zip32Address,
      };
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const { derived } = state;

      delete derived[id];
      state.derived = derived;
    },
    renameAccount: (state, action: PayloadAction<[string, string]>) => {
      const [id, newAlias] = action.payload;
      const { derived } = state;

      const account = derived[id];

      derived[id] = {
        ...account,
        alias: newAlias,
      };

      state.derived = derived;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchBalanceByAccount.fulfilled,
      (state, action: PayloadAction<{ id: string; balance: number }>) => {
        const { id, balance } = action.payload;

        state.derived[id] = {
          ...state.derived[id],
          balance,
        };
      }
    );

    builder.addCase(submitInitAccountTransaction.pending, (state, action) => {
      const account = action.meta.arg;
      const { id } = account;

      state.derived[id].isInitializing = true;
      state.derived[id].accountInitializationError = undefined;
    });

    builder.addCase(submitInitAccountTransaction.rejected, (state, action) => {
      const { meta, error } = action;
      const account = meta.arg;
      const { id } = account;

      // TODO this is now triggering for the shielded accounts. Once
      // transparent and shielded are refactored together, check this out
      if (state.derived[id]) {
        state.derived[id].isInitializing = false;
        state.derived[id].accountInitializationError = error
          ? error.message
          : "Error initializing account";
      }
    });

    builder.addCase(
      submitInitAccountTransaction.fulfilled,
      (state, action: PayloadAction<DerivedAccount>) => {
        const account = action.payload;
        const { id } = account;

        state.derived[id] = {
          ...account,
          isInitializing: false,
          accountInitializationError: undefined,
        };
      }
    );

    // TODO merge these all at some point to one place
    addAccountReducersToBuilder(builder);
  },
});

const { actions, reducer } = accountsSlice;

export const {
  addAccount,
  setEstablishedAddress,
  setZip32Address,
  removeAccount,
  renameAccount,
} = actions;

export default reducer;
