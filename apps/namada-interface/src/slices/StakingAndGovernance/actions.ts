import { createAsyncThunk } from "@reduxjs/toolkit";
import { FETCH_VALIDATORS, FETCH_VALIDATOR_DETAILS } from "./types";

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

export const fetchValidators = createAsyncThunk(FETCH_VALIDATORS, async () => {
  return Promise.resolve({});
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
