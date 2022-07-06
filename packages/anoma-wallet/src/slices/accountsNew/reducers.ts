import { ActionReducerMapBuilder } from "@reduxjs/toolkit";
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
    .addCase(reset, (state, action) => {
      // TODO remove this
      // this is just for debugging as the app stayed in a
      // state where the UI got blocked
      state.isAddingAccountInReduxState = false;
    })
    .addCase(createShieldedAccount.pending, (state, action) => {
      // state.isAddingAccountInReduxState = true;
    })
    .addCase(createShieldedAccount.fulfilled, (state, action) => {
      state.isAddingAccountInReduxState = false;
      const payload = action.payload;
      if (payload) {
        const { shieldedKeysAndAddress, newAccountDetails } = payload;
        const { alias, tokenType } = newAccountDetails;
        const uuid = crypto.randomUUID();
        state.shieldedAccounts[uuid] = {
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
    .addCase(createShieldedAccount.rejected, (state, action) => {
      state.isAddingAccountInReduxState = false;
    })
    .addCase(updateShieldedBalances.fulfilled, (state, action) => {
      const { payload } = action;
      let shieldedBalances: ShieldedBalancesPayload = {};
      if (payload) {
        shieldedBalances = payload;
      }

      for (const [key, shieldedBalance] of Object.entries(shieldedBalances)) {
        if (state.shieldedAccounts[key]) {
          state.shieldedAccounts[key].balance = shieldedBalance;
        }
      }
    })
    .addCase(updateShieldedBalances.rejected, (_state, _action) => {
      // TODO
      // implement this once the notification system is in place
    });

  return builder;
};
