import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Config } from "config";
import { Tokens, TokenType, TxResponse } from "constants/";
import { Account, RpcClient, SocketClient } from "lib";
import { stringToHash } from "utils/helpers";
import { submitTransferTransaction } from "./transfers";

export type InitialAccount = {
  alias: string;
  tokenType: TokenType;
  address: string;
  publicKey: string;
  signingKey: string;
  establishedAddress?: string;
  zip32Address?: string;
};

export type DerivedAccount = InitialAccount & {
  id: string;
  balance: number;
};

type DerivedAccounts = {
  [id: string]: DerivedAccount;
};

export type AccountsState = {
  derived: DerivedAccounts;
  isAccountInitializing: boolean;
  accountInitializationError?: string;
  isLoadingFromFaucet: boolean;
  newAccountId?: string;
};

const ACCOUNTS_ACTIONS_BASE = "accounts";
const { url } = new Config().network;

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
  async (account: InitialAccount, thunkApi) => {
    const { signingKey: privateKey, tokenType } = account;

    const epoch = await rpcClient.queryEpoch();
    const anomaAccount = await new Account().init();
    const { hash, bytes } = await anomaAccount.initialize({
      token: Tokens[tokenType].address,
      privateKey,
      epoch,
    });

    await socketClient.broadcastTx(bytes);
    const events = await socketClient.subscribeNewBlock(hash);
    socketClient.disconnect();

    const initializedAccounts = events[TxResponse.InitializedAccounts];
    const establishedAddress = initializedAccounts
      .map((account: string) => JSON.parse(account))
      .find((account: string[]) => account.length > 0)[0];

    const initializedAccount = {
      ...account,
      id: stringToHash(account.alias),
      balance: 0,
      establishedAddress,
    };

    if (url.match(/testnet/)) {
      thunkApi.dispatch(
        submitTransferTransaction({
          account: initializedAccount,
          target: establishedAddress || "",
          amount: 1000,
          memo: "Initial funds",
          shielded: false,
          useFaucet: true,
        })
      );
    }

    return initializedAccount;
  }
);

const initialState: AccountsState = {
  derived: {},
  isAccountInitializing: false,
  isLoadingFromFaucet: false,
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
    clearNewAccountId: (state) => {
      state.newAccountId = undefined;
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
      state.isLoadingFromFaucet = false;
      state.accountInitializationError = undefined;
    });

    builder.addCase(submitInitAccountTransaction.rejected, (state) => {
      state.isAccountInitializing = false;
      state.isLoadingFromFaucet = false;
      state.accountInitializationError = "Error initializing account";
    });

    builder.addCase(
      submitInitAccountTransaction.fulfilled,
      (state, action: PayloadAction<InitialAccount>) => {
        state.isAccountInitializing = false;
        state.isLoadingFromFaucet = false;
        state.accountInitializationError = undefined;
        const account = action.payload;
        const { alias } = account;
        const id = stringToHash(alias);

        state.newAccountId = id;
        state.derived = {
          ...state.derived,
          [id]: {
            id,
            balance: 0,
            ...account,
          },
        };
      }
    );
  },
});

const { actions, reducer } = accountsSlice;

export const {
  addAccount,
  clearNewAccountId,
  setEstablishedAddress,
  setZip32Address,
  removeAccount,
  renameAccount,
} = actions;

export default reducer;
