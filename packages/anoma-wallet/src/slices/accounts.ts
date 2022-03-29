import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DerivedAccount = {
  alias: string;
  tokenType: string;
  address: string;
  publicKey: string;
  signingKey: string;
  establishedAddress?: string;
  zip32Address?: string;
};

type DerivedAccounts = {
  [alias: string]: DerivedAccount;
};

export type DerivedAccountsState = {
  derived: DerivedAccounts;
};

const initialState: DerivedAccountsState = {
  derived: {},
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<DerivedAccount>) => {
      const { alias, tokenType, address, publicKey, signingKey } =
        action.payload;

      state.derived = {
        ...state.derived,
        [alias]: {
          alias,
          tokenType,
          address,
          publicKey,
          signingKey,
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
      state.derived[alias] = {
        ...state.derived[alias],
        establishedAddress,
      };
    },
    setZip32Address: (
      state,
      action: PayloadAction<{
        alias: string;
        zip32Address: string;
      }>
    ) => {
      const { alias, zip32Address } = action.payload;
      state.derived[alias] = {
        ...state.derived[alias],
        zip32Address,
      };
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      const alias = action.payload;

      const { derived } = state;
      delete derived[alias];
      state.derived = derived;
    },
    renameAccount: (state, action: PayloadAction<[string, string]>) => {
      const [previousAlias, newAlias] = action.payload;

      const { derived } = state;
      const account = { ...derived[previousAlias] };
      delete derived[previousAlias];
      derived[newAlias] = {
        ...account,
        alias: newAlias,
      };

      state.derived = derived;
    },
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
