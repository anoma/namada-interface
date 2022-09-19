import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMyBalances,
  fetchValidators,
  fetchMyValidators,
  fetchValidatorDetails,
} from "./actions";
import { STAKING_AND_GOVERNANCE } from "./types";
import { StakingAndGovernanceState } from "./types";

const initialState: StakingAndGovernanceState = {
  myBalances: [],
  validators: [],
  myValidators: [],
};

export const stakingAndGovernanceSlice = createSlice({
  name: STAKING_AND_GOVERNANCE,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBalances.fulfilled, (state, action) => {
        // stop the loader
        state.myBalances = action.payload.myBalances;
      })
      .addCase(fetchValidators.fulfilled, (state, action) => {
        // stop the loader
        state.validators = action.payload.allValidators;
      })
      .addCase(fetchValidators.rejected, (state, _action) => {
        // stop the loader
        state.validators = [];
      })
      .addCase(fetchMyValidators.fulfilled, (state, action) => {
        // stop the loader
        state.myValidators = action.payload.myValidators;
      })
      .addCase(fetchMyValidators.rejected, (state, _action) => {
        // stop the loader
        state.myValidators = [];
      })
      .addCase(fetchValidatorDetails.pending, (state, _action) => {
        // start the loader
        state.selectedValidatorId = undefined;
      })
      .addCase(fetchValidatorDetails.fulfilled, (state, action) => {
        // stop the loader
        state.selectedValidatorId = action.payload?.name;
      });
  },
});

const { reducer } = stakingAndGovernanceSlice;
export { reducer };
