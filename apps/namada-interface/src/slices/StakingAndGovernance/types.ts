export const STAKING_AND_GOVERNANCE = "stakingAndGovernance";
export const FETCH_MY_BALANCES = `${STAKING_AND_GOVERNANCE}/FETCH_MY_BALANCES`;
export const FETCH_VALIDATORS = `${STAKING_AND_GOVERNANCE}/FETCH_VALIDATORS`;
export const FETCH_MY_VALIDATORS = `${STAKING_AND_GOVERNANCE}/FETCH_MY_VALIDATORS`;
export const FETCH_MY_STAKING_POSITIONS = `${STAKING_AND_GOVERNANCE}/FETCH_MY_STAKING_POSITIONS`;
export const FETCH_VALIDATOR_DETAILS = `${STAKING_AND_GOVERNANCE}/FETCH_VALIDATOR_DETAILS`;
export const POST_NEW_STAKING = `${STAKING_AND_GOVERNANCE}/POST_NEW_STAKING`;
export const POST_UNSTAKING = `${STAKING_AND_GOVERNANCE}/POST_UNSTAKING`;

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
  description: string;
};

// represents users staking position
export type StakingPosition = Unique & {
  stakingStatus: string;
  stakedAmount: string;
  stakedCurrency: string;
  totalRewards: string;
  validatorId: ValidatorId;
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
};

// represents a state for ongoing staking
export enum StakingOrUnstakingState {
  Idle,
  Staking,
  Unstaking,
}

// this represents a change in staking position
// if positive, we are posting new bonding
// negative, we are decreasing it
export type ChangeInStakingPosition = {
  validatorId: ValidatorId;
  amount: string;
  stakingCurrency: string;
};

export type StakingAndGovernanceState = {
  validators: Validator[];
  myValidators: MyValidators[];
  myStakingPositions: StakingPosition[];
  selectedValidatorId?: ValidatorId;
  stakingOrUnstakingState: StakingOrUnstakingState;
};
