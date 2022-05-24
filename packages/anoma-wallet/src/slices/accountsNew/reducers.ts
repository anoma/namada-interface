import { createReducer, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { addAccountToLedger } from "./actions";
import reducer from "../accounts";
export const addAccountReducersToBuilder = (
  builder: ActionReducerMapBuilder<ReturnType<typeof reducer>>
): ActionReducerMapBuilder<ReturnType<typeof reducer>> => {
  builder
    .addCase(addAccountToLedger.pending, (state, action) => {
      state.isAddingAccountReduxState = true;
    })
    .addCase(addAccountToLedger.fulfilled, (state, action) => {
      state.isAddingAccountReduxState = false;
    })
    .addCase(addAccountToLedger.rejected, (state, action) => {
      state.isAddingAccountReduxState = false;
    });

  return builder;
};
