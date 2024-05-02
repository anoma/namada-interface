import BigNumber from "bignumber.js";

import { Proposal, ProposalStatus, Votes } from "./types";

export const fetchCurrentEpoch = async (): Promise<BigNumber> => BigNumber(10);

export const fetchProposalCounter = async (): Promise<number> =>
  TEST_PROPOSALS.length;

export const fetchProposalById = async (id: number): Promise<Proposal> => {
  const proposal = TEST_PROPOSALS[id];
  if (typeof proposal === "undefined") {
    throw new Error("no proposal!");
  }
  return proposal;
};

export const fetchProposalVotes = async (id: number): Promise<Votes> => ({
  yes: BigNumber(1000.22),
  no: BigNumber(325.111),
  abstain: BigNumber(133.00002),
});

export const fetchProposalStatus = async (
  id: number,
  currentEpoch: BigNumber
): Promise<ProposalStatus> => {
  const { startEpoch, endEpoch } = await fetchProposalById(id);

  if (startEpoch.isGreaterThan(currentEpoch)) {
    return { status: "pending" };
  } else if (endEpoch.isGreaterThan(currentEpoch)) {
    return { status: "ongoing" };
  } else {
    return { status: "finished", passed: id % 2 === 0 };
  }
};

export const fetchProposalVoted = async (
  id: number,
  address: string
): Promise<boolean> => id % 2 === 0;

const TEST_PROPOSALS: Proposal[] = [
  {
    id: "0",
    content: {
      title: "Some proposal",
    },
    startEpoch: BigNumber(4),
    endEpoch: BigNumber(12),
    graceEpoch: BigNumber(0),
    proposalType: "default",
    author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  },
  {
    id: "1",
    content: {
      title: "Another proposal",
    },
    startEpoch: BigNumber(10),
    endEpoch: BigNumber(14),
    graceEpoch: BigNumber(0),
    proposalType: "pgf_payment",
    author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  },
  {
    id: "2",
    content: {
      title: "Propose something else",
    },
    startEpoch: BigNumber(14),
    endEpoch: BigNumber(16),
    graceEpoch: BigNumber(0),
    proposalType: "pgf_steward",
    author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  },
  {
    id: "3",
    content: {
      title: "Propose another thing",
    },
    startEpoch: BigNumber(3),
    endEpoch: BigNumber(5),
    graceEpoch: BigNumber(0),
    proposalType: "pgf_payment",
    author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  },
  {
    id: "4",
    content: {
      title: "Propose more things",
    },
    startEpoch: BigNumber(3),
    endEpoch: BigNumber(7),
    graceEpoch: BigNumber(0),
    proposalType: "pgf_payment",
    author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  },
  {
    id: "5",
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
    startEpoch: BigNumber(4),
    endEpoch: BigNumber(14),
    graceEpoch: BigNumber(0),
    proposalType: "pgf_payment",
    author: "tnam13jfi53tgjefji3rheeeeeeeeeeeeeeeeeeeeeeeeeee",
  },
];
