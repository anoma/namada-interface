import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenType } from "constants/";
import { stringToHash } from "utils/helpers";

export type DerivedAccount = {
  alias: string;
  tokenType: TokenType;
  address: string;
  publicKey: string;
  signingKey: string;
  establishedAddress?: string;
  zip32Address?: string;
};

type DerivedAccounts = {
  [hash: string]: DerivedAccount;
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
      const {
        alias,
        tokenType,
        address,
        publicKey,
        signingKey,
        establishedAddress,
      } = action.payload;

      const hash = stringToHash(alias);

      state.derived = {
        ...state.derived,
        [hash]: {
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
      const hash = stringToHash(alias);

      state.derived[hash] = {
        ...state.derived[hash],
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
      const hash = stringToHash(alias);

      state.derived[hash] = {
        ...state.derived[hash],
        zip32Address,
      };
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      const alias = action.payload;
      const { derived } = state;
      const hash = stringToHash(alias);

      delete derived[hash];
      state.derived = derived;
    },
    renameAccount: (state, action: PayloadAction<[string, string]>) => {
      const [previousAlias, newAlias] = action.payload;
      const { derived } = state;
      const previousHash = stringToHash(previousAlias);
      const newHash = stringToHash(newAlias);

      const account = { ...derived[previousHash] };
      delete derived[previousAlias];
      derived[newHash] = {
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
