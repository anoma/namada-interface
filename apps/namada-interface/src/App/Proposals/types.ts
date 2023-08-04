import BigNumber from "bignumber.js";

export type Proposal = {
  id: string;
  proposalType: string;
  author: string;
  startEpoch: bigint;
  endEpoch: bigint;
  graceEpoch: bigint;
  content: Partial<{ [key: string]: string }>;
  status: string;
  yesVotes?: BigNumber;
  totalVotingPower?: BigNumber;
  result?: string;
};
