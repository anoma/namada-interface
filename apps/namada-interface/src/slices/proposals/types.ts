import BigNumber from "bignumber.js";

export type Proposal = {
  id: string;
  content: { [key: string]: string | undefined };
  startEpoch: bigint;
  endEpoch: bigint;
  graceEpoch: bigint;
  proposalType: ProposalType;
};

export const proposalStatuses = [
  "upcoming",
  "ongoing",
  "passed",
  "rejected",
] as const;
export type ProposalStatus = (typeof proposalStatuses)[number];

export type ProposalType = "pgf_steward" | "pgf_payment" | "default";

export const voteTypes = ["yes", "no", "veto", "abstain"];
export type VoteType = (typeof voteTypes)[number];

export type Votes = Record<VoteType, BigNumber>;
