import { ActionReducerMapBuilder, PayloadAction } from "@reduxjs/toolkit";
import {
  createShieldedAccount,
  reset,
  updateShieldedBalances,
  ShieldedBalancesPayload,
} from "./actions";
import reducer from "../accounts";

export const addAccountReducersToBuilder = (
  builder: ActionReducerMapBuilder<ReturnType<typeof reducer>>
): ActionReducerMapBuilder<ReturnType<typeof reducer>> => {
  builder
    .addCase(reset, (state) => {
      // TODO remove this
      // this is just for debugging as the app stayed in a
      // state where the UI got blocked
      state.isAddingAccountInReduxState = false;
    })
    .addCase(createShieldedAccount.pending, (state) => {
      state.isAddingAccountInReduxState = true;
    })
    .addCase(createShieldedAccount.fulfilled, (state, action) => {
      state.isAddingAccountInReduxState = false;
      const payload = action.payload;
      if (payload) {
        const { chainId, shieldedKeysAndAddress, newAccountDetails } = payload;
        const { alias, tokenType } = newAccountDetails;
        const uuid = crypto.randomUUID();

        if (!state.shieldedAccounts[chainId]) {
          state.shieldedAccounts[chainId] = {};
        }

        state.shieldedAccounts[chainId][uuid] = {
          chainId,
          shieldedKeysAndPaymentAddress: shieldedKeysAndAddress,
          isShielded: true,
          alias: alias,
          // balance also do not really translate to shielded
          // but maybe this can hold the calculates balance from the notes
          balance: 0,
          address: "this_should_be_the_current_masp_address",
          tokenType: tokenType,
          signingKey: "signingKey",
          publicKey: "publicKey",
          id: uuid,
        };
      }
    })
    .addCase(createShieldedAccount.rejected, (state) => {
      state.isAddingAccountInReduxState = false;
    })
    .addCase(
      updateShieldedBalances.fulfilled,
      (state, action: PayloadAction<ShieldedBalancesPayload | undefined>) => {
        const { chainId = "", shieldedBalances = {} } = action.payload || {};

        const shieldedAccounts = state.shieldedAccounts[chainId];

        for (const [key, shieldedBalance] of Object.entries(shieldedBalances)) {
          if (shieldedAccounts[key] && typeof shieldedBalance === "number") {
            state.shieldedAccounts[chainId][key].balance = shieldedBalance;
          }
        }
      }
    )
    .addCase(updateShieldedBalances.rejected, () => {
      // TODO
      // implement this once the notification system is in place
    });

  return builder;
};
