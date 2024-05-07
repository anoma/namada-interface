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
  votes: Votes;
};

export type Pending = { status: "pending" };
export type Ongoing = { status: "ongoing" };
export type Finished = { status: "finished"; passed: boolean };
export type ProposalStatus = Pending | Ongoing | Finished;

export type Default = { type: "default"; data?: null };
export type PgfSteward = { type: "pgf_steward" };
export type PgfPayment = { type: "pgf_payment" };
export type ProposalType = Default | PgfSteward | PgfPayment;

export const voteTypes = ["yes", "no", "abstain"];
export type VoteType = (typeof voteTypes)[number];

export type Votes = Record<VoteType, BigNumber>;
