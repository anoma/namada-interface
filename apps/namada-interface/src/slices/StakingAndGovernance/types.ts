import BigNumber from "bignumber.js";

export const STAKING_AND_GOVERNANCE = "stakingAndGovernance";
export const FETCH_VALIDATORS = `${STAKING_AND_GOVERNANCE}/FETCH_VALIDATORS`;
export const FETCH_TOTAL_BONDS = `${STAKING_AND_GOVERNANCE}/FETCH_TOTAL_BONDS`;
export const FETCH_MY_VALIDATORS = `${STAKING_AND_GOVERNANCE}/FETCH_MY_VALIDATORS`;
export const FETCH_MY_STAKING_POSITIONS = `${STAKING_AND_GOVERNANCE}/FETCH_MY_STAKING_POSITIONS`;
export const FETCH_EPOCH = `${STAKING_AND_GOVERNANCE}/FETCH_EPOCH`;
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
  homepageUrl: string;
  votingPower?: BigNumber;
  commission: BigNumber;
  description: string;
};

// Look up validator assets by address
export type ValidatorAssets = Record<
  string,
  {
    votingPower: BigNumber;
    commission: BigNumber;
  }
>;

// represents users staking position
export type StakingPosition = Unique & {
  bonded: boolean;
  withdrawableEpoch?: BigNumber;
  stakedAmount: BigNumber;
  owner: string;
  totalRewards: string;
  validatorId: ValidatorId;
};

// represents users staking position combined with the validator
export type MyValidators = Unique & {
  stakingStatus: string;
  stakedAmount?: BigNumber;
  unbondedAmount?: BigNumber;
  withdrawableAmount?: BigNumber;
  validator: Validator;
};

// represents users staking position combined with the validator
export type MyBalanceEntry = Unique & {
  key: string;
  baseCurrency: string;
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
export type ChangeInStakingPosition = {
  validatorId: ValidatorId;
  owner: string;
  amount: BigNumber;
  memo?: string;
  gasPrice: BigNumber;
  gasLimit: BigNumber;
};

export type StakingAndGovernanceState = {
  validators: Validator[];
  validatorAssets: ValidatorAssets;
  myValidators?: MyValidators[];
  myStakingPositions: StakingPosition[];
  selectedValidatorId?: ValidatorId;
  stakingOrUnstakingState: StakingOrUnstakingState;
  epoch?: BigNumber;
};
