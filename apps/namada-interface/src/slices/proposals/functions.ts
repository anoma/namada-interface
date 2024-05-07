import { getIntegration } from "@namada/integrations";
import { Account, Chain } from "@namada/types";
import BigNumber from "bignumber.js";

import {
  Proposal,
  ProposalStatus,
  ProposalWithExtraInfo,
  Votes,
  VoteType,
} from "@namada/types";

export const fetchCurrentEpoch = async (): Promise<BigNumber> => BigNumber(10);

export const fetchProposalCounter = async (): Promise<number> =>
  TEST_PROPOSALS.length;
//sdk.then(({ rpc }) => rpc.queryProposalCounter());

export const fetchProposalById = async (id: number): Promise<Proposal> => {
  const proposal = TEST_PROPOSALS[id];
  if (typeof proposal === "undefined") {
    throw new Error("no proposal!");
  }
  return proposal;
};

export const fetchProposalByIdWithExtraInfo = async (
  id: number,
  address: string,
  currentEpoch: bigint
): Promise<ProposalWithExtraInfo> => {
  const proposal = await fetchProposalById(id);
  const voted = await fetchProposalVoted(id, address);
  const status = await fetchProposalStatus(id, currentEpoch);
  const votes = await fetchProposalVotes(id);

  return { proposal, voted, status, votes };
};

export const fetchAllProposals = async (
  proposalCounter: number
): Promise<Proposal[]> =>
  Promise.all(
    Array.from({ length: proposalCounter }, (_, id) => fetchProposalById(id))
  );

export const fetchAllProposalsWithExtraInfo = async (
  proposalCounter: number,
  address: string,
  currentEpoch: bigint
): Promise<ProposalWithExtraInfo[]> =>
  Promise.all(
    Array.from({ length: proposalCounter }, (_, id) =>
      fetchProposalByIdWithExtraInfo(id, address, currentEpoch)
    )
  );

export const fetchProposalVotes = async (id: number): Promise<Votes> => ({
  yes: BigNumber(1000.22),
  no: BigNumber(325.111),
  abstain: BigNumber(133.00002),
});

export const fetchProposalStatus = async (
  id: number,
  currentEpoch: bigint
): Promise<ProposalStatus> => {
  const { startEpoch, endEpoch } = await fetchProposalById(id);

  if (startEpoch > currentEpoch) {
    return { status: "pending" };
  } else if (endEpoch > currentEpoch) {
    return { status: "ongoing" };
  } else {
    return { status: "finished", passed: id % 2 === 0 };
  }
};

export const fetchProposalVoted = async (
  id: number,
  address: string
): Promise<boolean> => id % 2 === 0;

export const performVote = async (
  proposalId: number,
  vote: VoteType,
  account: Account,
  chain: Chain
): Promise<void> => {
  const signer = getIntegration("namada").signer();

  if (typeof signer === "undefined") {
    throw new Error("no signer");
  }

  const token = chain.currency.address;
  if (typeof token === "undefined") {
    throw new Error("no chain currency address");
  }

  const publicKey = account.publicKey;
  if (typeof publicKey === "undefined") {
    throw new Error("no public key on account");
  }

  return await signer.submitVoteProposal(
    {
      signer: account.address,
      proposalId: BigInt(proposalId),
      vote,
    },
    {
      token,
      feeAmount: BigNumber(0),
      gasLimit: BigNumber(20_000),
      chainId: chain.chainId,
      publicKey,
      memo: "",
    },
    account.type
  );
};

const TEST_PROPOSALS: Proposal[] = [
  //{
  //  id: "0",
  //  content: {
  //    title: "Some proposal",
  //  },
  //  startEpoch: BigNumber(4),
  //  endEpoch: BigNumber(12),
  //  graceEpoch: BigNumber(0),
  //  proposalType: {
  //    type: "default",
  //  },
  //  author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  //},
  //{
  //  id: "1",
  //  content: {
  //    title: "Another proposal",
  //  },
  //  startEpoch: BigNumber(10),
  //  endEpoch: BigNumber(14),
  //  graceEpoch: BigNumber(0),
  //  proposalType: { type: "pgf_payment" },
  //  author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  //},
  //{
  //  id: "2",
  //  content: {
  //    title: "Propose something else",
  //  },
  //  startEpoch: BigNumber(14),
  //  endEpoch: BigNumber(16),
  //  graceEpoch: BigNumber(0),
  //  proposalType: { type: "pgf_steward" },
  //  author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  //},
  //{
  //  id: "3",
  //  content: {
  //    title: "Propose another thing",
  //  },
  //  startEpoch: BigNumber(3),
  //  endEpoch: BigNumber(5),
  //  graceEpoch: BigNumber(0),
  //  proposalType: { type: "pgf_payment" },
  //  author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  //},
  //{
  //  id: "4",
  //  content: {
  //    title: "Propose more things",
  //  },
  //  startEpoch: BigNumber(3),
  //  endEpoch: BigNumber(7),
  //  graceEpoch: BigNumber(0),
  //  proposalType: { type: "pgf_payment" },
  //  author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  //},
  //{
  //  id: "5",
  //  content: {
  //    title: "Stewie for Steward 2024",
  //    authors: "stewie@heliax.dev",
  //    "discussions-to": "forum.namada.net/t/stewies-manifesto/1",
  //    created: "2024-01-01T00:00:01Z",
  //    license: "MIT",
  //    abstract:
  //      "Stewie is running for steward, with a focus on technical research. The technical research I will be focused on will definitely not be for weapons of mass destruction. There is some possibility however that I may be focusing somewhat on open source software for weapons of mass destruction.",
  //    motivation:
  //      "Nobody knows technical research better than me. Trust me. I know it. I have the best technical research. I will be the best steward. Last night, Namada called me and said, Stewie, thank you. I will make public goods funding great again",
  //    details:
  //      "As a genius baby, I possess an unmatched level of intelligence and a visionary mindset. I will utilize these qualities to solve the most complex problems, and direct public goods funding towards weapons of mass destruction ... i mean open source software for weapons of mass destruction",
  //  },
  //  startEpoch: BigNumber(4),
  //  endEpoch: BigNumber(14),
  //  graceEpoch: BigNumber(0),
  //  proposalType: {
  //    type: "default",
  //    data: [1,2,3]
  //  },
  //  author: "tnam13jfi53tgjefji3rheeeeeeeeeeeeeeeeeeeeeeeeeee",
  //},
];
