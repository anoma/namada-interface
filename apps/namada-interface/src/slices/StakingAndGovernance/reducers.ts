import { createSlice } from "@reduxjs/toolkit";
import { fetchValidators, fetchValidatorDetails } from "./actions";
import { STAKING_AND_GOVERNANCE } from "./types";
import { Validator, ValidatorId } from "./types";

export type StakingAndGovernanceState = {
  validators: Record<ValidatorId, Validator>;
  selectedValidatorId?: ValidatorId;
};

const initialState: StakingAndGovernanceState = {
  validators: {},
};

export const stakingAndGovernanceSlice = createSlice({
  name: STAKING_AND_GOVERNANCE,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchValidators.pending, (_state, _action) => {
        console.log({ _state, _action }, "fetchValidators.pending");
      })
      .addCase(fetchValidators.fulfilled, (_state, _action) => {
        console.log({ _state, _action }, "fetchValidators.fulfilled");
      })
      .addCase(fetchValidators.rejected, (_state, _action) => {
        console.log({ _state, _action }, "fetchValidators.rejected");
      })
      .addCase(fetchValidatorDetails.pending, (state, action) => {
        state.selectedValidatorId = undefined;
        console.log(
          action.meta.arg,
          "action.meta.arg @ fetchValidatorDetails.pending"
        );
      })
      .addCase(fetchValidatorDetails.fulfilled, (state, action) => {
        state.selectedValidatorId = action.payload?.name;
      })
      .addCase(fetchValidatorDetails.rejected, (_state, _action) => {
        console.log({ _state, _action }, "fetchValidatorDetails.rejected");
      });
  },
});

const { reducer } = stakingAndGovernanceSlice;
export { reducer };
