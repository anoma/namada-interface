import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  FETCH_MY_BALANCES,
  FETCH_VALIDATORS,
  FETCH_VALIDATOR_DETAILS,
  FETCH_MY_VALIDATORS,
  FETCH_MY_STAKING_POSITIONS,
  POST_NEW_STAKING,
  POST_UNSTAKING,
  Validator,
  ValidatorDetailsPayload,
  MyBalanceEntry,
  MyValidators,
  StakingPosition,
  ChangeInStakingPosition,
} from "./types";
import { allValidatorsData, myStakingData, myBalancesData } from "./fakeData";

// this retrieves the validators
// this dispatches further actions that are depending on
// validators data
export const fetchValidators = createAsyncThunk<
  { allValidators: Validator[] },
  void
>(FETCH_VALIDATORS, async (_, thunkApi) => {
  const allValidators = allValidatorsData;
  thunkApi.dispatch(fetchMyValidators(allValidators));
  return Promise.resolve({ allValidators });
});

export const fetchValidatorDetails = createAsyncThunk<
  ValidatorDetailsPayload | undefined,
  string
>(FETCH_VALIDATOR_DETAILS, async (validatorId: string) => {
  try {
    return Promise.resolve({
      name: validatorId,
    });
  } catch {
    return Promise.reject();
  }
});

// util to add validators to the user's staking entries
const myStakingToMyValidators = (
  myStaking: StakingPosition[],
  allValidators: Validator[]
): MyValidators[] => {
  // try {
  const myValidators: MyValidators[] = myStaking.map((myStakingEntry) => {
    // let's get the validator we are going to add
    const validator = allValidators.find(
      (validator) => validator.uuid === myStakingEntry.validatorId
    );

    // this should not happen if the data is not corrupted
    if (validator === undefined) {
      throw `Validator with ID ${myStakingEntry.validatorId} not found`;
    }

    return { ...myStakingEntry, validator: validator };
  });
  return myValidators;
};

// fetches staking data and appends the validators to it
// this needs the validators, so they are being passed in
// vs. getting them from the state
//
// TODO this or fetchMyStakingPositions is likely redundant based on
// real data model stored in the chain, adjust when implementing the real data
export const fetchMyValidators = createAsyncThunk<
  { myValidators: MyValidators[] },
  Validator[]
>(FETCH_MY_VALIDATORS, async (allValidatorsData: Validator[]) => {
  try {
    const myValidators = myStakingToMyValidators(
      myStakingData,
      allValidatorsData
    );
    return Promise.resolve({ myValidators });
  } catch (error) {
    console.warn(`error: ${error}`);
    return Promise.reject({});
  }
});

export const fetchMyStakingPositions = createAsyncThunk<
  { myStakingPositions: StakingPosition[] },
  void
>(FETCH_MY_STAKING_POSITIONS, async () => {
  return Promise.resolve({ myStakingPositions: myStakingData });
});

export const fetchMyBalances = createAsyncThunk<
  { myBalances: MyBalanceEntry[] },
  void
>(FETCH_MY_BALANCES, async () => {
  return Promise.resolve({ myBalances: myBalancesData });
});

// we generate the new staking transaction
// we post the new staking transaction
// once it is accepted to the chain, we dispatch the below actions to get
// the new updated balances and validator amounts:
// * fetchMyBalances
// * fetchMyValidators
export const postNewStaking = createAsyncThunk<void, ChangeInStakingPosition>(
  POST_NEW_STAKING,
  async (changeInStakingPosition: ChangeInStakingPosition) => {
    console.log(
      changeInStakingPosition,
      "changeInStakingPosition at postNewStaking"
    );
    return Promise.resolve();
  }
);

// we post an unstake transaction
// once it is accepted to the chain, we dispatch the below actions to get
// the new updated balances and validator amounts:
// * fetchMyBalances
// * fetchMyValidators
export const postUnstaking = createAsyncThunk<void, string>(
  POST_UNSTAKING,
  async (stakingPositionId: string) => {
    console.log(stakingPositionId, "stakingPositionId at postUnstaking");
    return Promise.resolve();
  }
);
