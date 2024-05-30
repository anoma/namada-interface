import BigNumber from "bignumber.js";

export const proposalStatuses = [
  "pending",
  "ongoing",
  "passed",
  "rejected",
] as const;

export type ProposalStatus = (typeof proposalStatuses)[number];

export const isProposalStatus = (str: string): str is ProposalStatus =>
  proposalStatuses.includes(str as ProposalStatus);

export type Proposal = {
  id: bigint;
  author: string;
  content: { [key: string]: string | undefined };
  startEpoch: bigint;
  endEpoch: bigint;
  activationEpoch: bigint;
  startTime: number;
  endTime: number;
  currentTime: number;
  proposalType: ProposalType;
  tallyType: TallyType;
  status: ProposalStatus;
  totalVotingPower: BigNumber;
} & {
  [VT in VoteType]: BigNumber;
};

export type AddRemove = {
  add?: string;
  remove: string[];
};

// TODO: add IBC target
export type PgfTarget = {
  internal: {
    amount: BigNumber;
    target: string;
  };
};

export type PgfActions = {
  continuous: {
    add: PgfTarget[];
    remove: PgfTarget[];
  };
  retro: PgfTarget[];
};

export type Default = { type: "default" };
export type DefaultWithWasm = { type: "default_with_wasm"; data: Uint8Array };
export type PgfSteward = { type: "pgf_steward"; data: AddRemove };
export type PgfPayment = { type: "pgf_payment"; data: PgfActions };
export type ProposalType = Default | DefaultWithWasm | PgfSteward | PgfPayment;

export type ProposalTypeString = ProposalType["type"];

export const voteTypes = ["yay", "nay", "abstain"] as const;
export type VoteType = (typeof voteTypes)[number];

export const isVoteType = (str: string): str is VoteType =>
  voteTypes.includes(str as VoteType);

export type Votes = Record<VoteType, BigNumber>;

type VoteCommonProperties = {
  address: string;
  voteType: VoteType;
};

export type ValidatorVote = {
  isValidator: true;
  votingPower: BigNumber;
} & VoteCommonProperties;

export const isValidatorVote = (vote: Vote): vote is ValidatorVote =>
  vote.isValidator;

export type DelegatorVote = {
  isValidator: false;
  votingPower: [string, BigNumber][];
} & VoteCommonProperties;

export const isDelegatorVote = (vote: Vote): vote is DelegatorVote =>
  !vote.isValidator;

export type Vote = DelegatorVote | ValidatorVote;

export const tallyTypes = [
  "two-thirds",
  "one-half-over-one-third",
  "less-one-half-over-one-third-nay",
] as const;

export type TallyType = (typeof tallyTypes)[number];

export const isTallyType = (tallyType: string): tallyType is TallyType =>
  tallyTypes.includes(tallyType as TallyType);
