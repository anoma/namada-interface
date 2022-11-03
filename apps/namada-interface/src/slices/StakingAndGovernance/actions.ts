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
import { myStakingData, myBalancesData } from "./fakeData";
import { RootState } from "store";
import Config from "config";
// import { RpcClient } from "@anoma/rpc";
import { Abci, init as initShared } from "@anoma/shared";

const toValidator = ([address, votingPower]: [string, string]): Validator => ({
  uuid: address,
  name: address,
  votingPower: `${votingPower}NAM`,
  homepageUrl: "htttp://namada.me",
  commission: "TBD",
  description: "TBD",
});
// this retrieves the validators
// this dispatches further actions that are depending on
// validators data
export const fetchValidators = createAsyncThunk<
  { allValidators: Validator[] },
  void,
  { state: RootState }
>(FETCH_VALIDATORS, async (_, thunkApi) => {
  const { chainId } = thunkApi.getState().settings;
  const { network } = Config.chain[chainId];

  await initShared();
  const abci = new Abci(`http://${network.url}`);
  const allValidators = (await abci.query_all_validators()).map(toValidator);

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
  Validator[],
  { state: RootState }
>(FETCH_MY_VALIDATORS, async (allValidatorsData: Validator[], thunkApi) => {
  try {
    const { chainId } = thunkApi.getState().settings;
    const { network } = Config.chain[chainId];
    const accounts = thunkApi.getState().accounts.derived[chainId];
    const establishedAddresses = Object.values(accounts).map(
      (a) => a.establishedAddress
    ).filter((a): a is string => typeof a === "string");

    await initShared();
    const abci = new Abci(`http://${network.url}`);
    const myValidators = (await abci.query_my_validators(establishedAddresses[0])).map(
      toValidator
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
export const postNewBonding = createAsyncThunk<void, ChangeInStakingPosition>(
  POST_NEW_STAKING,
  async (changeInStakingPosition: ChangeInStakingPosition) => {
    console.log(
      "Should create a new bonding transaction and post it to the chain with the following data:"
    );
    console.log(changeInStakingPosition);
    return Promise.resolve();
  }
);

// we post an unstake transaction
// once it is accepted to the chain, we dispatch the below actions to get
// the new updated balances and validator amounts:
// * fetchMyBalances
// * fetchMyValidators
export const postNewUnbonding = createAsyncThunk<void, ChangeInStakingPosition>(
  POST_UNSTAKING,
  async (changeInStakingPosition: ChangeInStakingPosition) => {
    console.log(
      "Should create a new unbonding transaction and post it to the chain with the following data:"
    );
    console.log(changeInStakingPosition);
    return Promise.resolve();
  }
);
