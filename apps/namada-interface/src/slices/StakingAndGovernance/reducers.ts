import { createSlice } from "@reduxjs/toolkit";
import {
  fetchValidatorDetails,
  fetchValidators,
  fetchMyBalances,
  fetchMyValidators,
  fetchMyStakingPositions,
  postNewStaking,
  postUnstaking,
} from "./actions";
import {
  STAKING_AND_GOVERNANCE,
  StakingAndGovernanceState,
  CurrentState,
} from "./types";

const initialState: StakingAndGovernanceState = {
  myBalances: [],
  validators: [],
  myValidators: [],
  myStakingPositions: [],
  currentState: CurrentState.Idle,
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
      })
      .addCase(fetchMyStakingPositions.fulfilled, (state, action) => {
        // stop the loader
        state.myStakingPositions = action.payload?.myStakingPositions;
      })
      .addCase(postNewStaking.pending, (state, _action) => {
        // stop the loader
        state.currentState = CurrentState.Staking;
      })
      .addCase(postNewStaking.fulfilled, (state, _action) => {
        // stop the loader
        state.currentState = CurrentState.Idle;
      })
      .addCase(postNewStaking.rejected, (state, _action) => {
        state.currentState = CurrentState.Idle;
      })
      .addCase(postUnstaking.pending, (state, _action) => {
        // stop the loader
        state.currentState = CurrentState.Unstaking;
      })
      .addCase(postUnstaking.fulfilled, (state, _action) => {
        // stop the loader
        state.currentState = CurrentState.Idle;
      })
      .addCase(postUnstaking.rejected, (state, _action) => {
        state.currentState = CurrentState.Idle;
      });
  },
});

const { reducer } = stakingAndGovernanceSlice;
export { reducer };
