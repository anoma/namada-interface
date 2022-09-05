import { Settings } from "http2";

export const STAKING_AND_GOVERNANCE = "stakingAndGovernance";
export const FETCH_VALIDATORS = `${STAKING_AND_GOVERNANCE}/FETCH_VALIDATORS`;
export const FETCH_VALIDATOR_DETAILS = `${STAKING_AND_GOVERNANCE}/FETCH_VALIDATOR_DETAILS`;

export enum StakingAndGovernanceErrors {
  StakingAndGovernanceErrors = "StakingAndGovernanceError.GenericError",
}

// TODO check this out, what format, do we have constrains
export type ValidatorId = string;

type Unique = {
  uuid: string;
};

export type Validator = Unique & {
  name: string;
  votingPower: string;
  homepageUrl: string;
  commission: string;
};

// USE THIS
// export type MyStaking = Unique & {
//   stakingStatus: string;
//   stakedAmount: string;
//   validator: Validator;
// };

// PLACEHOLDERS
export type MyStaking = {
  uuid: string;
  name: string;
  homepageUrl: string;
  stakingStatus: string;
  stakedAmount: string;
};

export type MyBalanceRow = {
  uuid: string;
  key: string;
  baseCurrency: string;
  fiatCurrency: string;
};
