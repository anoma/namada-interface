import { ActionReducerMapBuilder, PayloadAction } from "@reduxjs/toolkit";
import { fetchValidators, fetchValidatorDetails } from "./actions";
import reducer from "../accounts";

export const addAccountReducersToBuilder = (
  builder: ActionReducerMapBuilder<ReturnType<typeof reducer>>
): ActionReducerMapBuilder<ReturnType<typeof reducer>> => {
  builder
    .addCase(fetchValidators.pending, (_state, _action) => {})
    .addCase(fetchValidators.fulfilled, (_state, _action) => {})
    .addCase(fetchValidators.rejected, (_state, _action) => {})
    .addCase(fetchValidatorDetails.pending, (_state, _action) => {})
    .addCase(fetchValidatorDetails.fulfilled, (_state, _action) => {})
    .addCase(fetchValidatorDetails.rejected, (_state, _action) => {});

  return builder;
};
