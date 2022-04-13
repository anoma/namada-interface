import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Config } from "config";
import { Tokens, TokenType, TxResponse } from "constants/";
import { Account, RpcClient, SocketClient } from "lib";
import { stringToHash } from "utils/helpers";

export type DerivedAccount = {
  id: string;
  alias: string;
  tokenType: TokenType;
  address: string;
  publicKey: string;
  signingKey: string;
  balance?: number;
  establishedAddress?: string;
  zip32Address?: string;
};

export type InitialAccount = Omit<DerivedAccount, "id">;

type DerivedAccounts = {
  [id: string]: DerivedAccount;
};

export type AccountsState = {
  derived: DerivedAccounts;
  isAccountInitializing: boolean;
  accountInitializationError?: string;
};

const ACCOUNTS_ACTIONS_BASE = "accounts";

enum AccountThunkActions {
  FetchBalanceByAddress = "fetchBalanceByAddress",
  SubmitInitAccountTransaction = "submitInitAccountTransaction",
}

const { network, wsNetwork } = new Config();
const rpcClient = new RpcClient(network);
const socketClient = new SocketClient(wsNetwork);

export const fetchBalanceByAddress = createAsyncThunk(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountThunkActions.FetchBalanceByAddress}`,
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
  async (account: InitialAccount) => {
    const { signingKey: privateKey, tokenType } = account;

    // Query epoch:
    const epoch = await rpcClient.queryEpoch();

    // Create init-account transaction:
    const anomaAccount = await new Account().init();
    const { hash, bytes } = await anomaAccount.initialize({
      token: Tokens[tokenType].address,
      privateKey,
      epoch,
    });

    await socketClient.broadcastTransaction(bytes);

    const events = await socketClient.subscribeNewBlock(hash);
    socketClient.disconnect();

    const initializedAccounts = events[TxResponse.InitializedAccounts];
    const establishedAddress = initializedAccounts
      .map((account: string) => JSON.parse(account))
      .find((account: string[]) => account.length > 0)[0];

    if (network.network.match(/testnet/)) {
      // Load from faucet
    }

    return {
      ...account,
      establishedAddress,
    };
  }
);

const initialState: AccountsState = {
  derived: {},
  isAccountInitializing: false,
};

const accountsSlice = createSlice({
  name: ACCOUNTS_ACTIONS_BASE,
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<InitialAccount>) => {
      const {
        alias,
        tokenType,
        address,
        publicKey,
        signingKey,
        establishedAddress,
      } = action.payload;

      const id = stringToHash(alias);

      state.derived = {
        ...state.derived,
        [id]: {
          id: id,
          alias,
          tokenType,
          address,
          publicKey,
          signingKey,
          establishedAddress,
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
    builder.addCase(fetchBalanceByAddress.fulfilled, (state, action) => {
      const { id, balance } = action.payload;

      state.derived[id] = {
        ...state.derived[id],
        balance,
      };
    });

    builder.addCase(submitInitAccountTransaction.pending, (state) => {
      state.isAccountInitializing = true;
      state.accountInitializationError = undefined;
    });

    builder.addCase(submitInitAccountTransaction.rejected, (state) => {
      state.isAccountInitializing = false;
      state.accountInitializationError = "Error initializing account";
    });

    builder.addCase(
      submitInitAccountTransaction.fulfilled,
      (state, action: PayloadAction<InitialAccount>) => {
        state.isAccountInitializing = false;
        state.accountInitializationError = undefined;
        const {
          alias,
          tokenType,
          address,
          publicKey,
          signingKey,
          establishedAddress,
        } = action.payload;
        const id = stringToHash(alias);

        state.derived = {
          ...state.derived,
          [id]: {
            id,
            alias,
            tokenType,
            address,
            publicKey,
            signingKey,
            establishedAddress,
          },
        };
      }
    );
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
