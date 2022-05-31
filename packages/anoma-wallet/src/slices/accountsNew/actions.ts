import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  createAction,
} from "@reduxjs/toolkit";
import {
  ADD_ACCOUNT_TO_LEDGER,
  NewAccountDetails,
  ShieldedAccount,
} from "./types";
import { RootState } from "store/store";
import { Wallet, Session } from "lib";
import { DerivedAccount, AccountsState } from "slices/accounts";
import {
  MaspShieldedAccount,
  createShieldedMasterAccount,
  createShieldedDerivedAccount,
  ShieldedAccountType,
} from "@anoma/masp-web";

const getAccountIndex = (
  accounts: DerivedAccount[],
  tokenType: string
): number =>
  accounts.filter((account: DerivedAccount) => account.tokenType === tokenType)
    .length;

type ShieldedKeysAndAddressesWithNewAccountDetails = {
  shieldedKeysAndAddress: ShieldedAccount;
  newAccountDetails: NewAccountDetails;
};

/**
 * Adds an account to the ledger. This takes care of the transparent and shielded
 * accounts.
 */
export const addAccountToLedger = createAsyncThunk<
  ShieldedKeysAndAddressesWithNewAccountDetails | undefined,
  NewAccountDetails
>(
  ADD_ACCOUNT_TO_LEDGER,
  async (newAccountDetails: NewAccountDetails, thunkAPI) => {
    try {
      // create spending key
      // create payment address based on the spending key

      // TODO figure out if this is master or derived
      const mnemonic = await new Session().getSeed();
      const derivedPath = "TODO";
      const { alias, isShielded, tokenType } = newAccountDetails;
      const InitiatedMaspShieldedAccount = await MaspShieldedAccount.init();

      // either master or derived
      if (mnemonic) {
        const shieldedAccountWithRustFields = createShieldedMasterAccount(
          alias,
          mnemonic
        ) as ShieldedAccountType;

        const shieldedAccount = {
          viewingKey: shieldedAccountWithRustFields.viewing_key,
          spendingKey: shieldedAccountWithRustFields.spending_key,
          paymentAddress: shieldedAccountWithRustFields.payment_address,
        };

        const payload: ShieldedKeysAndAddressesWithNewAccountDetails = {
          newAccountDetails: newAccountDetails,
          shieldedKeysAndAddress: shieldedAccount,
        };

        return payload;
      }
      Promise.reject("could not create seed phrase");
    } catch (error) {
      Promise.reject(error);
    }
  }
);

export const reset = createAction("reset");
