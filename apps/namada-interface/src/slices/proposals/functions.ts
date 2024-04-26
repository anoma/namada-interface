import BigNumber from "bignumber.js";

import { Proposal, ProposalStatus, Votes } from "./types";

export const fetchProposals = (): Proposal[] => [
  {
    id: "862",
    content: {
      title: "Some proposal",
    },
    startEpoch: BigInt(4),
    endEpoch: BigInt(12),
    graceEpoch: BigInt(0),
    proposalType: "default",
  },
  {
    id: "2",
    content: {
      title: "Another proposal",
    },
    startEpoch: BigInt(10),
    endEpoch: BigInt(14),
    graceEpoch: BigInt(0),
    proposalType: "pgf_payment",
  },
  {
    id: "3",
    content: {
      title: "Propose something else",
    },
    startEpoch: BigInt(14),
    endEpoch: BigInt(16),
    graceEpoch: BigInt(0),
    proposalType: "pgf_steward",
  },
  {
    id: "4",
    content: {
      title: "Propose another thing",
    },
    startEpoch: BigInt(3),
    endEpoch: BigInt(5),
    graceEpoch: BigInt(0),
    proposalType: "pgf_payment",
  },
  {
    id: "5",
    content: {
      title: "Propose more things",
    },
    startEpoch: BigInt(3),
    endEpoch: BigInt(7),
    graceEpoch: BigInt(0),
    proposalType: "pgf_payment",
  },
  {
    id: "999",
    content: {
      title: "Stewie for Steward 2024",
      authors: "stewie@heliax.dev",
      "discussions-to": "forum.namada.net/t/stewies-manifesto/1",
      created: "2024-01-01T00:00:01Z",
      license: "MIT",
      abstract:
        "Stewie is running for steward, with a focus on technical research. The technical research I will be focused on will definitely not be for weapons of mass destruction. There is some possibility however that I may be focusing somewhat on open source software for weapons of mass destruction.",
      motivation:
        "Nobody knows technical research better than me. Trust me. I know it. I have the best technical research. I will be the best steward. Last night, Namada called me and said, Stewie, thank you. I will make public goods funding great again",
      details:
        "As a genius baby, I possess an unmatched level of intelligence and a visionary mindset. I will utilize these qualities to solve the most complex problems, and direct public goods funding towards weapons of mass destruction ... i mean open source software for weapons of mass destruction",
    },
    startEpoch: BigInt(3),
    endEpoch: BigInt(7),
    graceEpoch: BigInt(0),
    proposalType: "pgf_payment",
  },
];

export const fetchCurrentEpoch = (): bigint => BigInt(10);

export const proposalStatus = (
  proposal: Proposal,
  votes: Votes,
  currentEpoch: bigint
): ProposalStatus => {
  const { startEpoch, endEpoch } = proposal;

  if (startEpoch > currentEpoch) {
    return "upcoming";
  } else if (endEpoch > currentEpoch) {
    return "ongoing";
  } else {
    // TODO: fake data
    return Number(proposal.id) % 2 === 0 ? "passed" : "rejected";
  }
};

export const fetchVotes = (id: string): Votes => ({
  yes: BigNumber(1000.22),
  no: BigNumber(325.111),
  veto: BigNumber(44.22),
  abstain: BigNumber(133.00002),
});

export const fetchVoted = (id: string): boolean => Number(id) % 2 === 0;
