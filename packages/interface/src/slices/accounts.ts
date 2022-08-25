import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Config, { RPCConfig } from "config";
import { Account, TxWasm, VpWasm, Symbols, Tokens, TokenType } from "@anoma/tx";
import {
  RpcClient,
  SocketClient,
  NewBlockEvents,
  TxResponse,
} from "@anoma/rpc";
import { fetchWasmCode, promiseWithTimeout, stringToHash } from "@anoma/utils";
import { submitTransferTransaction } from "./transfers";
import { addAccountReducersToBuilder } from "./AccountsNew/reducers";

export type InitialAccount = {
  chainId: string;
  alias: string;
  tokenType: TokenType;
  address: string;
  publicKey: string;
  signingKey: string;
  establishedAddress?: string;
  zip32Address?: string;
  isShielded?: boolean;
  isInitial?: boolean;
};

export type DerivedAccount = InitialAccount & {
  id: string;
  balance?: number;
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

// TODO redundant, refactor the data models
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
  derived: Record<string, DerivedAccounts>;
  shieldedAccounts: Record<string, ShieldedAccounts>;
};

const ACCOUNTS_ACTIONS_BASE = "accounts";

enum AccountThunkActions {
  FetchBalanceByAccount = "fetchBalanceByAccount",
  SubmitInitAccountTransaction = "submitInitAccountTransaction",
}

const LEDGER_INIT_ACCOUNT_TIMEOUT = 12000;

export const fetchBalanceByAccount = createAsyncThunk(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountThunkActions.FetchBalanceByAccount}`,
  async (account: DerivedAccount) => {
    const { chainId, id, establishedAddress, tokenType } = account;
    const chainConfig = Config.chain[chainId];

    const rpcClient = new RpcClient(chainConfig.network);
    const { address: tokenAddress = "" } = Tokens[tokenType];
    const balance = await rpcClient.queryBalance(
      tokenAddress,
      establishedAddress
    );
    return {
      chainId,
      id,
      balance: balance > 0 ? balance : 0,
    };
  }
);

export const submitInitAccountTransaction = createAsyncThunk(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountThunkActions.SubmitInitAccountTransaction}`,
  async (account: DerivedAccount, { dispatch, rejectWithValue }) => {
    const { chainId, signingKey: privateKey, tokenType, isInitial } = account;

    const chainConfig = Config.chain[chainId];
    const { faucet } = chainConfig;
    const { url, port, protocol, wsProtocol } = chainConfig.network;

    const rpcConfig = new RPCConfig(url, port, protocol, wsProtocol);
    const rpcClient = new RpcClient(rpcConfig.network);
    const socketClient = new SocketClient(rpcConfig.wsNetwork);

    const epoch = await rpcClient.queryEpoch();
    const txCode = await fetchWasmCode(TxWasm.InitAccount);
    const vpCode = await fetchWasmCode(VpWasm.User);

    const anomaAccount = await new Account(txCode, vpCode).init();
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
      return rejectWithValue(e);
    });

    const events = await promise;
    clearTimeout(timeoutId);
    socketClient.disconnect();

    const code = events[TxResponse.Code][0];
    const info = events[TxResponse.Info][0];

    if (code !== "0") {
      return rejectWithValue(info);
    }

    const initializedAccounts = events[TxResponse.InitializedAccounts];

    // TODO: This is a major bug when initializing multiple accounts!
    const establishedAddress = initializedAccounts
      .map((account: string) => JSON.parse(account))
      .find((account: string[]) => account.length > 0)[0];

    const initializedAccount = {
      ...account,
      balance: 0,
      establishedAddress,
    };

    if (faucet && isInitial) {
      // Fund initial tokens for testnet users:
      Symbols.forEach((symbol) => {
        dispatch(
          submitTransferTransaction({
            chainId,
            token: symbol,
            account: initializedAccount,
            target: establishedAddress || "",
            amount: 1000,
            memo: "Initial funds",
            faucet,
          })
        );
      });
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
      const { chainId, alias, isInitial, address } = initialAccount;

      const id = stringToHash(`${chainId}/${alias}/${address}`);
      if (!state.derived[chainId]) {
        state.derived[chainId] = {};
      }

      state.derived[chainId] = {
        ...state.derived[chainId],
        [id]: {
          id,
          isInitial,
          ...initialAccount,
        },
      };
    },
    setEstablishedAddress: (
      state,
      action: PayloadAction<{
        chainId: string;
        alias: string;
        establishedAddress: string;
      }>
    ) => {
      const { chainId, alias, establishedAddress } = action.payload;

      const { id } =
        Object.values(state.derived[chainId]).find(
          (account) => account.alias === alias
        ) || {};

      if (id) {
        state.derived[chainId][id] = {
          ...state.derived[chainId][id],
          establishedAddress,
        };
      }
    },
    setBalance: (
      state,
      action: PayloadAction<{ chainId: string; id: string; balance: number }>
    ) => {
      const { chainId, id } = action.payload;

      state.derived[chainId][id] = {
        ...state.derived[chainId][id],
      };
    },
    removeAccount: (
      state,
      action: PayloadAction<{ chainId: string; id: string }>
    ) => {
      const { chainId, id } = action.payload;
      const { derived } = state;

      delete derived[chainId][id];
      state.derived[chainId] = derived[chainId];
    },
    renameAccount: (
      state,
      action: PayloadAction<{ chainId: string; id: string; alias: string }>
    ) => {
      const { chainId, id, alias } = action.payload;
      const { derived } = state;

      const account = derived[chainId][id];

      derived[chainId][id] = {
        ...account,
        alias,
      };

      state.derived = derived;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchBalanceByAccount.fulfilled,
      (
        state,
        action: PayloadAction<{ chainId: string; id: string; balance: number }>
      ) => {
        const { chainId, id } = action.payload;

        state.derived[chainId][id] = {
          ...state.derived[chainId][id],
        };
      }
    );

    builder.addCase(submitInitAccountTransaction.pending, (state, action) => {
      const account = action.meta.arg;
      const { chainId, id } = account;

      state.derived[chainId][id].isInitializing = true;
      state.derived[chainId][id].accountInitializationError = undefined;
    });

    builder.addCase(submitInitAccountTransaction.rejected, (state, action) => {
      const { meta, error } = action;
      const account = meta.arg;
      const { chainId, id } = account;

      const derivedAccounts = state.derived[chainId] || {};

      // TODO this is now triggering for the shielded accounts. Once
      // transparent and shielded are refactored together, check this out
      if (derivedAccounts[id]) {
        derivedAccounts[id].isInitializing = false;
        derivedAccounts[id].accountInitializationError = error
          ? error.message
          : "Error initializing account";
      }
    });

    builder.addCase(
      submitInitAccountTransaction.fulfilled,
      (state, action: PayloadAction<DerivedAccount>) => {
        const account = action.payload;
        const { chainId, id } = account;

        state.derived[chainId][id] = {
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
  removeAccount,
  renameAccount,
} = actions;

export default reducer;
