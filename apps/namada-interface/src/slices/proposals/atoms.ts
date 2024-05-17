import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";

import { VoteType } from "@namada/types";
import { transparentAccountsAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";
import {
  fetchAllProposals,
  fetchAllProposalsWithExtraInfo,
  fetchCurrentEpoch,
  fetchProposalById,
  fetchProposalCode,
  fetchProposalCounter,
  fetchProposalStatus,
  fetchProposalVoted,
  fetchProposalVotes,
  fetchVotedProposalIds,
  performVote,
} from "./functions";

export const currentEpochAtom = atomWithQuery((get) => ({
  queryKey: ["current-epoch"],
  queryFn: () => fetchCurrentEpoch(get(chainAtom)),
}));

export const proposalCounterAtom = atomWithQuery((get) => ({
  queryKey: ["proposal-counter"],
  queryFn: () => fetchProposalCounter(get(chainAtom)),
}));

export const proposalFamily = atomFamily((id: bigint) =>
  atomWithQuery((get) => ({
    queryKey: ["proposal", id.toString()],
    queryFn: () => fetchProposalById(get(chainAtom), id),
  }))
);

export const proposalVotesFamily = atomFamily((id: bigint) =>
  atomWithQuery((get) => ({
    queryKey: ["proposal-votes", id.toString()],
    queryFn: () => fetchProposalVotes(get(chainAtom), id),
  }))
);

export const proposalStatusFamily = atomFamily((id: bigint) =>
  atomWithQuery((get) => ({
    queryKey: ["proposal-status", id.toString()],
    queryFn: () => fetchProposalStatus(get(chainAtom), id),
  }))
);

export const proposalVotedFamily = atomFamily((id: bigint) =>
  atomWithQuery((get) => ({
    queryKey: ["proposal-voted", id.toString()],
    queryFn: async () => {
      const [account] = get(transparentAccountsAtom);
      if (typeof account === "undefined") {
        throw new Error("no account found");
      }
      return await fetchProposalVoted(get(chainAtom), id, account);
    },
  }))
);

export const allProposalsAtom = atomWithQuery((get) => ({
  queryKey: ["all-proposals"],
  queryFn: () => fetchAllProposals(get(chainAtom)),
}));

export const allProposalsWithExtraInfoAtom = atomWithQuery((get) => ({
  queryKey: ["all-proposals-with-extra-info"],
  queryFn: async () => fetchAllProposalsWithExtraInfo(get(chainAtom)),
}));

export const votedProposalIdsAtom = atomWithQuery((get) => ({
  queryKey: ["voted-proposal-ids"],
  queryFn: async () => {
    const [account] = get(transparentAccountsAtom);
    if (typeof account === "undefined") {
      throw new Error("no account found");
    }
    return await fetchVotedProposalIds(get(chainAtom), account);
  },
}));

export const proposalCodeFamily = atomFamily((id: bigint) =>
  atomWithQuery((get) => ({
    queryKey: ["proposal-code", id.toString()],
    queryFn: () => fetchProposalCode(get(chainAtom), id),
  }))
);

type PerformVoteArgs = {
  proposalId: bigint;
  vote: VoteType;
};
export const performVoteAtom = atomWithMutation((get) => {
  return {
    mutationKey: ["voting"],
    mutationFn: async ({ proposalId, vote }: PerformVoteArgs) => {
      const chain = get(chainAtom);
      const [account] = get(transparentAccountsAtom);

      if (typeof account === "undefined") {
        throw new Error("no account");
      }

      performVote(proposalId, vote, account, chain);
    },
  };
});
