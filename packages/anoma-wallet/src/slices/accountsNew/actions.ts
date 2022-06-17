import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import {
  ADD_ACCOUNT_TO_LEDGER,
  UPDATE_SHIELDED_BALANCES,
  NewAccountDetails,
  ShieldedAccount,
} from "./types";
import { history, TopLevelRouteGenerator } from "App";
import { RootState } from "store/store";
import { Wallet, Session } from "lib";
import { DerivedAccount, AccountsState } from "slices/accounts";
import { getShieldedBalance } from "slices/shieldedTransfer";
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
export const createShieldedAccount = createAsyncThunk<
  ShieldedKeysAndAddressesWithNewAccountDetails | undefined,
  NewAccountDetails
>(
  ADD_ACCOUNT_TO_LEDGER,
  async (newAccountDetails: NewAccountDetails, _thunkAPI) => {
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

        history.push(TopLevelRouteGenerator.createRouteForWallet());
        return payload;
      }
      Promise.reject("could not create seed phrase");
    } catch (error) {
      Promise.reject(error);
    }
  }
);

export type ShieldedBalancesPayload = {
  [accountId: string]: number;
};
export const updateShieldedBalances = createAsyncThunk<
  ShieldedBalancesPayload | undefined,
  void
>(UPDATE_SHIELDED_BALANCES, async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const shieldedAccounts = state.accounts.shieldedAccounts;
    const shieldedBalances: ShieldedBalancesPayload = {};

    // TODO, is it good to have them all fail if one does, as now?
    for (const shieldedAccountId of Object.keys(shieldedAccounts)) {
      const shieldedAccount = shieldedAccounts[shieldedAccountId];
      const shieldedBalance = await getShieldedBalance(
        shieldedAccount.shieldedKeysAndPaymentAddress.spendingKey
      );
      // TODO unify the types and the location of conversions
      shieldedBalances[shieldedAccountId] = Number(shieldedBalance);
    }
    return Promise.resolve(shieldedBalances);
  } catch (error) {
    Promise.reject("error fetching shielded balances");
  }
});

export const reset = createAction("reset");
