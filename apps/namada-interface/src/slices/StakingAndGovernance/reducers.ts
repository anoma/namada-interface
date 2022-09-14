import { createSlice } from "@reduxjs/toolkit";
import { fetchValidators, fetchValidatorDetails } from "./actions";
import { STAKING_AND_GOVERNANCE } from "./types";
import { Validator, ValidatorId } from "./types";

export type StakingAndGovernanceState = {
  validators: Validator[];
  selectedValidatorId?: ValidatorId;
};

const initialState: StakingAndGovernanceState = {
  validators: [],
};

export const stakingAndGovernanceSlice = createSlice({
  name: STAKING_AND_GOVERNANCE,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchValidators.pending, (_state, _action) => {
        // start the loader
      })
      .addCase(fetchValidators.fulfilled, (state, action) => {
        // stop the loader
        state.validators = action.payload.allValidators;
      })
      .addCase(fetchValidators.rejected, (_state, _action) => {
        // stop the loader
      })
      .addCase(fetchValidatorDetails.pending, (state, action) => {
        // start the loader
        state.selectedValidatorId = undefined;
      })
      .addCase(fetchValidatorDetails.fulfilled, (state, action) => {
        // stop the loader
        state.selectedValidatorId = action.payload?.name;
      })
      .addCase(fetchValidatorDetails.rejected, (_state, _action) => {
        // stop the loader
      });
  },
});

const { reducer } = stakingAndGovernanceSlice;
export { reducer };
