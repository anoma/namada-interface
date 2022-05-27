import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ADD_ACCOUNT_TO_LEDGER, NewAccountDetails } from "./types";
import { RootState } from "store/store";
import { Wallet, Session } from "lib";
import { DerivedAccount, AccountsState } from "slices/accounts";
import { MaspShieldedAccount, createShieldedAccount } from "@anoma/masp-web";

const getAccountIndex = (
  accounts: DerivedAccount[],
  tokenType: string
): number =>
  accounts.filter((account: DerivedAccount) => account.tokenType === tokenType)
    .length;

/**
 * Adds an account to the ledger. This takes care of the transparent and shielded
 * accounts.
 *
 */
export const addAccountToLedger = createAsyncThunk(
  ADD_ACCOUNT_TO_LEDGER,
  async (newAccountDetails: NewAccountDetails, thunkAPI) => {
    try {
      // create spending key
      // create payment address based on the spending key

      const { alias, isShielded, tokenType } = newAccountDetails;
      const InitiatedMaspShieldedAccount = await MaspShieldedAccount.init();
      const shieldedAccount = createShieldedAccount(alias);
      // const state: RootState = thunkAPI.getState() as RootState;
      return shieldedAccount;
    } catch (error) {
      console.log(error, "error");
      Promise.reject(error);
    }
  }
);
