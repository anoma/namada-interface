import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
