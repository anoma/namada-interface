import { createSlice } from "@reduxjs/toolkit";
import {
  fetchValidatorDetails,
  fetchValidators,
  fetchTotalBonds,
  fetchMyValidators,
  fetchMyStakingPositions,
  fetchEpoch,
  postNewBonding,
  postNewUnbonding,
} from "./actions";
import {
  STAKING_AND_GOVERNANCE,
  StakingAndGovernanceState,
  StakingOrUnstakingState,
} from "./types";
import BigNumber from "bignumber.js";

const initialState: StakingAndGovernanceState = {
  validators: [],
  validatorAssets: {},
  myValidators: undefined,
  myStakingPositions: [],
  stakingOrUnstakingState: StakingOrUnstakingState.Idle,
  epoch: undefined,
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
      .addCase(fetchTotalBonds.fulfilled, (state, action) => {
        const { address, totalBonds } = action.payload;
        state.validatorAssets[address] = {
          votingPower: new BigNumber(totalBonds),
          commission:
            state.validatorAssets[address]?.commission || new BigNumber(0),
        };
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
      .addCase(fetchEpoch.fulfilled, (state, action) => {
        state.epoch = action.payload.epoch;
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
