import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import {
  ADD_ACCOUNT_TO_LEDGER,
  UPDATE_SHIELDED_BALANCES,
  NewAccountDetails,
  ShieldedAccount,
  AccountErrors,
} from "./types";
import { history, TopLevelRouteGenerator } from "App";
import { RootState } from "store/store";
import {
  getShieldedBalance,
  TRANSFER_CONFIGURATION,
} from "slices/shieldedTransfer";
import { ShieldedAccountType, getMaspWeb } from "@anoma/masp-web";
import { actions, CreateToastPayload, ToastId } from "slices/notifications";
import { TokenType } from "@anoma/types";

type NewAccountDetailsWithPassword = NewAccountDetails & {
  chainId: string;
  password: string;
};

type ShieldedKeysAndAddressesWithNewAccountDetails = {
  chainId: string;
  shieldedKeysAndAddress: ShieldedAccount;
  newAccountDetails: NewAccountDetails;
};

enum Toasts {
  CreateShieldedAccountStart,
  CreateShieldedAccountSuccess,
}

const getToast = (toastId: ToastId, toast: Toasts): CreateToastPayload => {
  const toasts: Record<Toasts, CreateToastPayload> = {
    [Toasts.CreateShieldedAccountStart]: {
      id: toastId,
      data: {
        title: "Creating account...",
        message: "Account creation started.",
        type: "info",
      },
    },
    [Toasts.CreateShieldedAccountSuccess]: {
      id: toastId,
      data: {
        title: "Success!",
        message: "New shielded account created.",
        type: "success",
      },
    },
  };

  return toasts[toast];
};

/**
 * Creates "shielded accounts" (viewing key, spending key, payment address)
 * after a successful creation navigates to TopLevelRouteGenerator.createRouteForWallet()
 * TODO take the followup action such as navigation as a parameter
 * or at least allow overriding the default
 */
export const createShieldedAccount = createAsyncThunk<
  ShieldedKeysAndAddressesWithNewAccountDetails | undefined,
  NewAccountDetailsWithPassword & { notify?: boolean }
>(
  ADD_ACCOUNT_TO_LEDGER,
  async (
    newAccountDetails: NewAccountDetailsWithPassword & { notify?: boolean },
    thunkAPI
  ) => {
    const { chainId, alias, password, notify } = newAccountDetails;

    if (notify) {
      thunkAPI.dispatch(
        actions.createToast(
          getToast(
            `${thunkAPI.requestId}-start`,
            Toasts.CreateShieldedAccountStart
          )
        )
      );
    }
    try {
      // TODO distinguish between master/derived
      // TODO: Session has been removed - this should be updated to use Extension!
      const mnemonic = undefined; //await Session.getSeed(password);

      if (mnemonic) {
        const initialisedMaspWeb = await getMaspWeb();
        const shieldedAccountWithRustFields =
          initialisedMaspWeb.createShieldedMasterAccount(
            alias,
            mnemonic
          ) as ShieldedAccountType;

        const shieldedAccount = {
          viewingKey: shieldedAccountWithRustFields.viewing_key,
          spendingKey: shieldedAccountWithRustFields.spending_key,
          paymentAddress: shieldedAccountWithRustFields.payment_address,
        };

        const payload: ShieldedKeysAndAddressesWithNewAccountDetails = {
          chainId,
          newAccountDetails,
          shieldedKeysAndAddress: shieldedAccount,
        };

        if (notify) {
          thunkAPI.dispatch(
            actions.createToast(
              getToast(
                `${thunkAPI.requestId}-success`,
                Toasts.CreateShieldedAccountSuccess
              )
            )
          );
        }

        // TODO allow overriding this
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
  chainId: string;
  shieldedBalances: {
    [accountId: string]: number | AccountErrors;
  };
};

// TODO: This needs to be updated for the extension!
export const updateShieldedBalances = createAsyncThunk<
  ShieldedBalancesPayload,
  void
>(UPDATE_SHIELDED_BALANCES, async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const { chainId } = state.settings;
    const shieldedAccounts = state.accounts.derived[chainId];
    const shieldedBalances: ShieldedBalancesPayload = {
      chainId,
      shieldedBalances: {},
    };

    for (const shieldedAccountId of Object.keys(shieldedAccounts)) {
      const shieldedAccount = shieldedAccounts[shieldedAccountId];
      /* const { tokenType } = shieldedAccount; */
      const tokenType = "NAM";
      const tokenAddress =
        TRANSFER_CONFIGURATION.tokenAddresses[tokenType as TokenType];
      // TODO: Update then re-enable this:
      /* const shieldedBalance = await getShieldedBalance( */
      /*   chainId, */
      /*   shieldedAccount.shieldedKeysAndPaymentAddress.spendingKey, */
      /*   tokenAddress */
      /* ); */

      /* const shieldedBalanceAsNumber = Number(shieldedBalance); */
      // TODO: Update, then re-enable this
      // if the casting failed, we reassign the return value
      /* if ( */
      /*   typeof shieldedBalanceAsNumber === "number" && */
      /*   isNaN(shieldedBalanceAsNumber) */
      /* ) { */
      /*   shieldedBalances.shieldedBalances[shieldedAccountId] = */
      /*     AccountErrors.NonNumericShieldedBalanceReturned; */
      /* } else { */
      /*   shieldedBalances.shieldedBalances[shieldedAccountId] = */
      /*     shieldedBalanceAsNumber; */
      /* } */
    }
    return Promise.resolve(shieldedBalances);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      AccountErrors.RetrievingShieldedBalancesFailed
    );
  }
});

export const reset = createAction("reset");
