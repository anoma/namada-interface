import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  FETCH_VALIDATORS,
  FETCH_VALIDATOR_DETAILS,
  FETCH_MY_VALIDATORS,
  FETCH_MY_STAKING_POSITIONS,
  POST_NEW_STAKING,
  POST_UNSTAKING,
  Validator,
  ValidatorDetailsPayload,
  MyValidators,
  StakingPosition,
  ChangeInStakingPosition,
} from "./types";
import { myStakingData } from "./fakeData";
import { RootState } from "store";
import { Query } from "@anoma/shared";
import { amountToMicro, fetchWasmCode } from "@anoma/utils";
import { SignedTx, Signer, Tokens, TxWasm } from "@anoma/types";
import { chains } from "@anoma/chains";
import { getIntegration } from "services";
import { Accounts } from "slices/accounts";

const toValidator = ([address, votingPower]: [string, string]): Validator => ({
  uuid: address,
  name: address,
  // TODO: voting power is multiplied by votes_per_token value defined in genesis file
  // currently it is 10
  votingPower: String(BigInt(votingPower) * BigInt(10)),
  homepageUrl: "http://namada.net",
  commission: "TBD",
  description: "TBD",
});

const toMyValidators = (
  acc: MyValidators[],
  [_, validator, stake]: [string, string, string]
): MyValidators[] => {
  const index = acc.findIndex((myValidator) => myValidator.uuid === validator);
  const v = acc[index];
  const sliceFn =
    index == -1
      ? (arr: MyValidators[]) => arr
      : (arr: MyValidators[], idx: number) => [
          ...arr.slice(0, idx),
          ...arr.slice(idx + 1),
        ];

  return [
    ...sliceFn(acc, index),
    {
      uuid: validator,
      stakingStatus: "Bonded",
      stakedAmount: String(Number(stake) + Number(v?.stakedAmount || 0)),
      validator: toValidator([
        validator,
        String(Number(stake) + Number(v?.stakedAmount || 0)),
      ]),
    },
  ];
};

const toStakingPosition = ([owner, validator, stake]: [
  string,
  string,
  string
]): StakingPosition => ({
  uuid: owner + validator,
  stakingStatus: "Bonded",
  stakedAmount: stake,
  owner,
  totalRewards: "TBD",
  validatorId: validator,
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
  const { rpc } = chains[chainId];

  const query = new Query(rpc);
  const allValidators = (await query.query_all_validators()).map(toValidator);

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

// fetches staking data and appends the validators to it
// this needs the validators, so they are being passed in
// vs. getting them from the state
//
// TODO this or fetchMyStakingPositions is likely redundant based on
// real data model stored in the chain, adjust when implementing the real data
export const fetchMyValidators = createAsyncThunk<
  { myValidators: MyValidators[]; myStakingPositions: StakingPosition[] },
  Validator[],
  { state: RootState }
>(FETCH_MY_VALIDATORS, async (_, thunkApi) => {
  try {
    const { chainId } = thunkApi.getState().settings;
    const { rpc } = chains[chainId];

    const accounts: Accounts = thunkApi.getState().accounts.derived[chainId];
    const addresses = Object.entries(accounts)
      .filter(([_, value]) => !value.isShielded)
      .map(([key]) => key);
    const query = new Query(rpc);
    const myValidatorsRes = await query.query_my_validators(addresses);

    const myValidators = myValidatorsRes.reduce(toMyValidators, []);
    const myStakingPositions = myValidatorsRes.map(toStakingPosition);

    return Promise.resolve({ myValidators, myStakingPositions });
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

// we generate the new staking transaction
// we post the new staking transaction
// once it is accepted to the chain, we dispatch the below actions to get
// the new updated balances and validator amounts:
// * fetchMyBalances
// * fetchMyValidators
export const postNewBonding = createAsyncThunk<
  void,
  ChangeInStakingPosition,
  { state: RootState }
>(POST_NEW_STAKING, async (change, thunkApi) => {
  const { chainId } = thunkApi.getState().settings;
  const integration = getIntegration(chainId);
  const signer = integration.signer() as Signer;
  await signer.submitBond({
    source: change.owner,
    validator: change.validatorId,
    amount: amountToMicro(Number(change.amount)),
    txCode: await fetchWasmCode(TxWasm.Bond),
    nativeToken: Tokens.NAM.address || "",
    tx: {
      token: Tokens.NAM.address || "",
      feeAmount: 0,
      gasLimit: 0,
      txCode: await fetchWasmCode(TxWasm.RevealPK),
    },
  });
});

// we post an unstake transaction
// once it is accepted to the chain, we dispatch the below actions to get
// the new updated balances and validator amounts:
// * fetchMyBalances
// * fetchMyValidators
export const postNewUnbonding = createAsyncThunk<
  void,
  ChangeInStakingPosition,
  { state: RootState }
>(POST_UNSTAKING, async (change, thunkApi) => {
  const { chainId } = thunkApi.getState().settings;
  const integration = getIntegration(chainId);
  const signer = integration.signer() as Signer;
  await signer.submitUnbond({
    source: change.owner,
    validator: change.validatorId,
    amount: amountToMicro(Number(change.amount)),
    txCode: await fetchWasmCode(TxWasm.Unbond),
    tx: {
      token: Tokens.NAM.address || "",
      feeAmount: 0,
      gasLimit: 0,
      txCode: await fetchWasmCode(TxWasm.RevealPK),
    },
  });
});
