import BigNumber from "bignumber.js";

export type Proposal = {
  id: bigint;
  author: string;
  content: { [key: string]: string | undefined };
  startEpoch: bigint;
  endEpoch: bigint;
  graceEpoch: bigint;
  proposalType: ProposalType;
  tallyType: TallyType;
};

export type ProposalWithExtraInfo = {
  proposal: Proposal;
  voted: boolean;
  status: ProposalStatus;
  votes: Vote[];
};

type ProposalStatusCommonProperties = {
  [VT in VoteType]: BigNumber;
} & {
  totalVotingPower: BigNumber;
};

export type Pending = {
  status: "pending";
} & ProposalStatusCommonProperties;

export type Ongoing = {
  status: "ongoing";
} & ProposalStatusCommonProperties;

export type Finished = {
  status: "finished";
  passed: boolean;
} & ProposalStatusCommonProperties;

export type ProposalStatus = Pending | Ongoing | Finished;

export type AddRemove = {
  add: string[];
  remove: string[];
};

// TODO: add IBC target
type PgfTarget = {
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

export type Default = { type: "default"; data?: string };
export type PgfSteward = { type: "pgf_steward"; data: AddRemove };
export type PgfPayment = { type: "pgf_payment"; data: PgfActions };
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

export const tallyTypes = [
  "two-thirds",
  "one-half-over-one-third",
  "less-one-half-over-one-third-nay",
] as const;

export type TallyType = (typeof tallyTypes)[number];

export const isTallyType = (tallyType: string): tallyType is TallyType =>
  tallyTypes.includes(tallyType as TallyType);
