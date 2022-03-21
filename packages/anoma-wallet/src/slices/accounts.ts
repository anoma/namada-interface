import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tokens, TxResponse } from "constants/";
import { Account as AnomaAccount, RpcClient, SocketClient } from "lib";
import { SerializedKeypair } from "lib/Keypair";
import { NewBlockEvents, SubscriptionEvents } from "lib/rpc/types";

export type Account = {
  alias: string;
  address: string;
  publicKey: string;
  encryptedSigningKey: string;
  establishedAddress?: string;
};

type Accounts = {
  [alias: string]: Account;
};

type InitialState = {
  accounts: Accounts;
};

const initialState: InitialState = {
  accounts: {},
};

// TODO: Perhaps pull network settings from config determined by env
const network = {
  network: "localhost",
  port: 26657,
};

// TODO: The following will be removed (see comments below).
// Leaving here for now as this embodies what will be needed on the
// client-side to initialize an account.

// The functionality will likely need to look like this:
// 1. Create an account (addAccount action)
// 2. From React, initialize that account (so we can register listeners there
//    to provide feedback)
// 3. In the `onNext()` callback, dispatch action `setEstablishedAddress` with
//    the address we receive from the ledger.
// 4. Profit
export const initializeAccountByKeypair = createAsyncThunk(
  "accounts/initialize",
  // Requires ed25519 Keypair
  async (keypair: SerializedKeypair) => {
    const rpcClient = new RpcClient(network);
    const account = await new AnomaAccount().init();
    const token = Tokens["BTC"].address;
    const epoch = await rpcClient.queryEpoch();

    const { hash, bytes } = await account.initialize({
      token,
      publicKey: keypair.public,
      privateKey: keypair.secret,
      epoch,
    });

    let establishedAddress: string;

    // TODO: This is the basic logic for broadcasting an init-account transaction.
    // However, as this registers a listener callback, returning a value like this
    // probably won't work, so we may need to instead dispatch the "setEstablishedAddress"
    // action whenever we receive an EstablishedAddress from the ledger.
    const socketClient = new SocketClient({ ...network, protocol: "ws" });
    await socketClient.broadcastTx(hash, bytes, {
      onNext: (subEvent) => {
        const { events }: { events: NewBlockEvents } =
          subEvent as SubscriptionEvents;
        const initializedAccounts = events[TxResponse.InitializedAccounts];
        establishedAddress = initializedAccounts[0].replaceAll(/\[|\]|"/g, "");
        socketClient.disconnect();
        return establishedAddress;
      },
      onError: (error) => console.error(error),
    });
  }
);

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<Account>) => {
      const {
        alias,
        address,
        publicKey,
        establishedAddress,
        encryptedSigningKey,
      } = action.payload;

      state.accounts = {
        ...state.accounts,
        [alias]: {
          alias,
          address,
          publicKey,
          establishedAddress,
          encryptedSigningKey,
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
      state.accounts[alias] = {
        ...state.accounts[alias],
        establishedAddress,
      };
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      const alias = action.payload;

      const { accounts } = state;
      delete accounts[alias];
      state.accounts = accounts;
    },
    renameAccount: (state, action: PayloadAction<[string, string]>) => {
      const [previousAlias, newAlias] = action.payload;

      const { accounts } = state;
      const account = { ...accounts[previousAlias] };
      delete accounts[previousAlias];
      accounts[newAlias] = {
        ...account,
        alias: newAlias,
      };

      state.accounts = accounts;
    },
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
