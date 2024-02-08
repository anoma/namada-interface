import { createAsyncThunk } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";

import { chains } from "@namada/chains";
import { getIntegration } from "@namada/integrations";
import { Query } from "@namada/shared";
import { Signer } from "@namada/types";

import { Account } from "slices/accounts";
import { RootState } from "store";
import {
  ChangeInStakingPosition,
  FETCH_EPOCH,
  FETCH_MY_STAKING_POSITIONS,
  FETCH_MY_VALIDATORS,
  FETCH_TOTAL_BONDS,
  FETCH_VALIDATORS,
  FETCH_VALIDATOR_DETAILS,
  MyValidators,
  POST_NEW_STAKING,
  POST_UNSTAKING,
  StakingPosition,
  Validator,
  ValidatorDetailsPayload,
} from "./types";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

const toValidator = (address: string): Validator => ({
  uuid: address,
  name: address,
  homepageUrl: "http://namada.net",
  commission: new BigNumber(0), // TODO: implement commission
  description: "TBD",
});

const toMyValidators = (
  acc: MyValidators[],
  [_, validator, stake, unbonded, withdrawable]: [
    string,
    string,
    string,
    string,
    string,
  ]
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

  const stakedAmount = new BigNumber(stake).plus(
    new BigNumber(v?.stakedAmount || 0)
  );

  const unbondedAmount = new BigNumber(unbonded).plus(
    new BigNumber(v?.unbondedAmount || 0)
  );

  const withdrawableAmount = new BigNumber(withdrawable).plus(
    new BigNumber(v?.withdrawableAmount || 0)
  );

  return [
    ...sliceFn(acc, index),
    {
      uuid: validator,
      stakingStatus: "Bonded",
      stakedAmount,
      unbondedAmount,
      withdrawableAmount,
      validator: toValidator(validator),
    },
  ];
};

const toBond = ([owner, validator, amount, startEpoch]: [
  string,
  string,
  string,
  string,
]): StakingPosition => {
  return {
    uuid: owner + validator + startEpoch,
    bonded: true,
    stakedAmount: new BigNumber(amount),
    owner,
    validatorId: validator,
    totalRewards: "TBD",
  };
};

const toUnbond = ([owner, validator, amount, startEpoch, withdrawableEpoch]: [
  string,
  string,
  string,
  string,
  string,
]): StakingPosition => {
  const bond = toBond([owner, validator, amount, startEpoch]);

  return {
    ...bond,
    bonded: false,
    withdrawableEpoch: new BigNumber(withdrawableEpoch),
  };
};

export const fetchTotalBonds = createAsyncThunk<
  { address: string; totalBonds: number },
  string,
  { state: RootState }
>(FETCH_TOTAL_BONDS, async (address: string, thunkApi) => {
  const { rpc } = thunkApi.getState().chain.config;
  const query = new Query(rpc);
  const result = await query.query_total_bonds(address);

  return Promise.resolve({ address, totalBonds: result || 0 });
});

export const fetchValidators = createAsyncThunk<
  { allValidators: Validator[] },
  void,
  { state: RootState }
>(FETCH_VALIDATORS, async (_, thunkApi) => {
  const { rpc } = thunkApi.getState().chain.config;

  const query = new Query(rpc);
  const queryResult = (await query.query_all_validator_addresses()) as string[];
  const allValidators = queryResult.map(toValidator);

  thunkApi.dispatch(fetchMyValidators(allValidators));
  thunkApi.dispatch(fetchMyStakingPositions());
  thunkApi.dispatch(fetchEpoch());

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
  { myValidators: MyValidators[] },
  Validator[],
  { state: RootState }
>(FETCH_MY_VALIDATORS, async (_, thunkApi) => {
  try {
    const { rpc, id } = thunkApi.getState().chain.config;

    const accounts: Account[] = Object.values(
      thunkApi.getState().accounts.derived[id]
    );
    const addresses = accounts
      .filter(({ details }) => !details.isShielded)
      .map(({ details }) => details.address);
    const query = new Query(rpc);
    const myValidatorsRes = await query.query_my_validators(addresses);

    const myValidators = myValidatorsRes.reduce(toMyValidators, []);

    return Promise.resolve({ myValidators });
  } catch (error) {
    console.warn(`error: ${error}`);
    return Promise.reject({});
  }
});

export const fetchMyStakingPositions = createAsyncThunk<
  { myStakingPositions: StakingPosition[] },
  void,
  { state: RootState }
>(FETCH_MY_STAKING_POSITIONS, async (_, thunkApi) => {
  try {
    const { id, rpc } = thunkApi.getState().chain.config;

    const accounts: Account[] = Object.values(
      thunkApi.getState().accounts.derived[id]
    );
    const addresses = accounts
      .filter(({ details }) => !details.isShielded)
      .map(({ details }) => details.address);
    const query = new Query(rpc);

    const [bonds, unbonds] = await query.query_staking_positions(addresses);

    return Promise.resolve({
      myStakingPositions: [...bonds.map(toBond), ...unbonds.map(toUnbond)],
    });
  } catch (error) {
    console.warn(`error: ${error}`);
    return Promise.reject({});
  }
});

export const fetchEpoch = createAsyncThunk<
  { epoch: BigNumber },
  void,
  { state: RootState }
>(FETCH_EPOCH, async (_, thunkApi) => {
  const { rpc } = thunkApi.getState().chain.config;

  const query = new Query(rpc);
  const epochString = await query.query_epoch();

  return Promise.resolve({ epoch: new BigNumber(epochString) });
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
  const { derived } = thunkApi.getState().accounts;
  const {
    id,
    chainId,
    currency: { address: nativeToken },
  } = thunkApi.getState().chain.config;
  const integration = getIntegration(chains.namada.id);
  const signer = integration.signer() as Signer;
  const {
    owner: source,
    validatorId: validator,
    amount,
    memo,
    gasLimit,
    gasPrice,
  } = change;
  const account = derived[id][source];
  const { type, publicKey } = account.details;

  await signer.submitBond(
    {
      source,
      validator,
      amount: new BigNumber(amount),
      nativeToken: nativeToken || tokenAddress,
    },
    {
      token: nativeToken || tokenAddress,
      feeAmount: gasPrice,
      gasLimit,
      chainId,
      publicKey,
      memo,
    },
    type
  );
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
  const { derived } = thunkApi.getState().accounts;
  const {
    id,
    chainId,
    currency: { address: nativeToken },
  } = thunkApi.getState().chain.config;

  const integration = getIntegration(id);
  const signer = integration.signer() as Signer;
  const {
    owner: source,
    validatorId: validator,
    amount,
    memo,
    gasPrice,
    gasLimit,
  } = change;
  const {
    details: { type, publicKey },
  } = derived[id][source];

  await signer.submitUnbond(
    {
      source,
      validator,
      amount: new BigNumber(amount),
    },
    {
      token: nativeToken || tokenAddress,
      feeAmount: gasPrice,
      gasLimit,
      chainId,
      publicKey,
      memo,
    },
    type
  );
});

export const postNewWithdraw = createAsyncThunk<
  void,
  {
    owner: string;
    validatorId: string;
    gasPrice: BigNumber;
    gasLimit: BigNumber;
  },
  { state: RootState }
>(
  POST_UNSTAKING,
  async ({ owner, validatorId, gasPrice, gasLimit }, thunkApi) => {
    const { derived } = thunkApi.getState().accounts;
    const {
      id,
      chainId,
      currency: { address: nativeToken },
    } = thunkApi.getState().chain.config;

    const integration = getIntegration(id);
    const signer = integration.signer() as Signer;
    const {
      details: { type, publicKey },
    } = derived[id][owner];

    await signer.submitWithdraw(
      {
        source: owner,
        validator: validatorId,
      },
      {
        token: nativeToken || tokenAddress,
        feeAmount: gasPrice,
        gasLimit,
        chainId,
        publicKey,
      },
      type
    );
  }
);
