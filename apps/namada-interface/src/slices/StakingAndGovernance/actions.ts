import { createAsyncThunk } from "@reduxjs/toolkit";
import { FETCH_VALIDATORS, FETCH_VALIDATOR_DETAILS, Validator } from "./types";
import {
  myBalancesData as _myBalancesData,
  allValidatorsData,
  myValidatorData as _myStakingPositions,
} from "./fakeData";
export type ValidatorsPayload = {
  chainId: string;
  shieldedBalances: {
    [accountId: string]: number;
  };
};

export type ValidatorDetailsPayload = {
  name: string;
  websiteUrl: string;
};

export const fetchValidators = createAsyncThunk<
  { allValidators: Validator[] },
  void
>(FETCH_VALIDATORS, async () => {
  return Promise.resolve({ allValidators: allValidatorsData });
});

export const fetchValidatorDetails = createAsyncThunk<
  ValidatorDetailsPayload | undefined,
  string
>(FETCH_VALIDATOR_DETAILS, async (validatorId: string) => {
  try {
    return Promise.resolve({
      name: "polychain",
      websiteUrl: "polychain.com",
    });
  } catch {
    return Promise.reject();
  }
});
