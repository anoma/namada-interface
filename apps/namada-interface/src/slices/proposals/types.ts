import BigNumber from "bignumber.js";

export type Proposal = {
  id: string;
  author: string;
  content: { [key: string]: string | undefined };
  startEpoch: BigNumber;
  endEpoch: BigNumber;
  graceEpoch: BigNumber;
  proposalType: ProposalType;
  data?: any; // TODO: fix this any type
};

export type ProposalWithExtraInfo = {
  proposal: Proposal;
  voted: boolean;
  status: ProposalStatus;
  votes: Votes;
};

export type Pending = { status: "pending" };
export type Ongoing = { status: "ongoing" };
export type Finished = { status: "finished"; passed: boolean };
export type ProposalStatus = Pending | Ongoing | Finished;

export type Default = { type: "default"; data?: any };
export type PgfSteward = { type: "pgf_steward" };
export type PgfPayment = { type: "pgf_payment" };
export type ProposalType = Default | PgfSteward | PgfPayment;

const voteTypes = ["yes", "no", "abstain"] as const;
type VoteType = (typeof voteTypes)[number];

export type Votes = Record<VoteType, BigNumber>;
