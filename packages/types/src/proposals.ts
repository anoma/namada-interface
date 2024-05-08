import BigNumber from "bignumber.js";

export type Proposal = {
  id: bigint;
  author: string;
  content: { [key: string]: string | undefined };
  startEpoch: bigint;
  endEpoch: bigint;
  graceEpoch: bigint;
  proposalType: ProposalType;
};

export type ProposalWithExtraInfo = {
  proposal: Proposal;
  voted: boolean;
  status: ProposalStatus;
  votes: Vote[];
};

export type Pending = { status: "pending" };
export type Ongoing = { status: "ongoing" };
export type Finished = { status: "finished"; passed: boolean };
export type ProposalStatus = Pending | Ongoing | Finished;

export type Default = { type: "default"; data?: null };
export type PgfSteward = { type: "pgf_steward" };
export type PgfPayment = { type: "pgf_payment" };
export type ProposalType = Default | PgfSteward | PgfPayment;

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
