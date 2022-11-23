import { ActionReducerMapBuilder, PayloadAction } from "@reduxjs/toolkit";
import { updateShieldedBalances, ShieldedBalancesPayload } from "./actions";
import reducer from "../accounts";

export const addAccountReducersToBuilder = (
  builder: ActionReducerMapBuilder<ReturnType<typeof reducer>>
): ActionReducerMapBuilder<ReturnType<typeof reducer>> => {
  builder
    .addCase(
      updateShieldedBalances.fulfilled,
      (state, action: PayloadAction<ShieldedBalancesPayload | undefined>) => {
        const { chainId, shieldedBalances = {} } = action.payload || {};

        if (chainId) {
          const shieldedAccounts = state.derived[chainId];

          for (const [key, shieldedBalance] of Object.entries(
            shieldedBalances
          )) {
            if (shieldedAccounts[key] && typeof shieldedBalance === "number") {
              // TODO: Update this with consolidated account type
              /* state.shieldedAccounts[chainId][key].balance = shieldedBalance; */
            }
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
