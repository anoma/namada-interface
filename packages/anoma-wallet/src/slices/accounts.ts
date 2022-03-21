import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Account = {
  alias: string;
  address: string;
  publicKey: string;
};

type Accounts = {
  [alias: string]: Account;
};

interface InitialState {
  accounts: Accounts | null;
}

const initialState: InitialState = {
  accounts: null,
};

const stopSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<Account>) => {
      const { alias, address, publicKey } = action.payload;

      state.accounts = {
        ...state.accounts,
        [alias]: {
          alias,
          address,
          publicKey,
        },
      };
    },
  },
});

const { actions, reducer } = stopSlice;
export const { addAccount } = actions;
export default reducer;
