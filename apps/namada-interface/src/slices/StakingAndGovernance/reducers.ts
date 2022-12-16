import { createSlice } from "@reduxjs/toolkit";
import {
  fetchValidatorDetails,
  fetchValidators,
  fetchMyValidators,
  fetchMyStakingPositions,
  postNewBonding,
  postNewUnbonding,
} from "./actions";
import {
  STAKING_AND_GOVERNANCE,
  StakingAndGovernanceState,
  StakingOrUnstakingState,
} from "./types";

const initialState: StakingAndGovernanceState = {
  validators: [],
  myValidators: [],
  myStakingPositions: [],
  stakingOrUnstakingState: StakingOrUnstakingState.Idle,
};

export const stakingAndGovernanceSlice = createSlice({
  name: STAKING_AND_GOVERNANCE,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
        state.myStakingPositions = action.payload.myStakingPositions;
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
      })
      .addCase(fetchMyStakingPositions.fulfilled, (state, action) => {
        // stop the loader
        state.myStakingPositions = action.payload?.myStakingPositions;
      })
      .addCase(postNewBonding.pending, (state, _action) => {
        // stop the loader
        state.stakingOrUnstakingState = StakingOrUnstakingState.Staking;
      })
      .addCase(postNewBonding.fulfilled, (state, _action) => {
        // stop the loader
        state.stakingOrUnstakingState = StakingOrUnstakingState.Idle;
      })
      .addCase(postNewBonding.rejected, (state, _action) => {
        state.stakingOrUnstakingState = StakingOrUnstakingState.Idle;
      })
      .addCase(postNewUnbonding.pending, (state, _action) => {
        // stop the loader
        state.stakingOrUnstakingState = StakingOrUnstakingState.Unstaking;
      })
      .addCase(postNewUnbonding.fulfilled, (state, _action) => {
        // stop the loader
        state.stakingOrUnstakingState = StakingOrUnstakingState.Idle;
      })
      .addCase(postNewUnbonding.rejected, (state, _action) => {
        state.stakingOrUnstakingState = StakingOrUnstakingState.Idle;
      });
  },
});

const { reducer } = stakingAndGovernanceSlice;
export { reducer };
