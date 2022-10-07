export const STAKING_AND_GOVERNANCE = "stakingAndGovernance";
export const FETCH_MY_BALANCES = `${STAKING_AND_GOVERNANCE}/FETCH_MY_BALANCES`;
export const FETCH_VALIDATORS = `${STAKING_AND_GOVERNANCE}/FETCH_VALIDATORS`;
export const FETCH_MY_VALIDATORS = `${STAKING_AND_GOVERNANCE}/FETCH_MY_VALIDATORS`;
export const FETCH_VALIDATOR_DETAILS = `${STAKING_AND_GOVERNANCE}/FETCH_VALIDATOR_DETAILS`;

export enum StakingAndGovernanceErrors {
  StakingAndGovernanceErrors = "StakingAndGovernanceError.GenericError",
}

// TODO check this out, what format, do we have constrains
export type ValidatorId = string;

// PLACEHOLDER
type Unique = {
  uuid: string;
};

// represents the details of a validator
export type Validator = Unique & {
  name: string;
  votingPower: string;
  homepageUrl: string;
  commission: string;
};

// represents users staking position
export type MyStaking = Unique & {
  stakingStatus: string;
  stakedAmount: string;
  validatorId: string;
};

// represents users staking position combined with the validator
export type MyValidators = Unique & {
  stakingStatus: string;
  stakedAmount: string;
  validator: Validator;
};

// represents users staking position combined with the validator
export type MyBalanceEntry = Unique & {
  key: string;
  baseCurrency: string;
  fiatCurrency: string;
};

// PLACEHOLDER
export type ValidatorDetailsPayload = {
  name: string;
  websiteUrl: string;
};

export type StakingAndGovernanceState = {
  myBalances: MyBalanceEntry[];
  validators: Validator[];
  myValidators: MyValidators[];
  selectedValidatorId?: ValidatorId;
};
