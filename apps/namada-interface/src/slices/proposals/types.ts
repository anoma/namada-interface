import BigNumber from "bignumber.js";

export type Proposal = {
  id: string;
  author: string;
  content: { [key: string]: string | undefined };
  startEpoch: BigNumber;
  endEpoch: BigNumber;
  graceEpoch: BigNumber;
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

export type ProposalType = "pgf_steward" | "pgf_payment" | "default";

export const voteTypes = ["yes", "no", "abstain"];
export type VoteType = (typeof voteTypes)[number];

export type Votes = Record<VoteType, BigNumber>;
