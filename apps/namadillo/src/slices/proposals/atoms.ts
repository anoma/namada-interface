import { ProposalStatus, ProposalTypeString, VoteType } from "@namada/types";
import { useAtomValue } from "jotai";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import { defaultAccountAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";
import {
  fetchAllProposals,
  fetchCurrentEpoch,
  fetchProposalById,
  fetchProposalCounter,
  fetchProposalVoted,
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

export const proposalVotedFamily = atomFamily((id: bigint) => {
  const account = useAtomValue(defaultAccountAtom);
  return atomWithQuery((get) => ({
    queryKey: ["proposal-voted", id.toString()],
    enabled: account.isSuccess,
    queryFn: async () => {
      if (typeof account.data === "undefined") {
        throw new Error("no account found");
      }
      return await fetchProposalVoted(get(chainAtom), id, account.data);
    },
  }));
});

export const allProposalsAtom = atomWithQuery((get) => ({
  queryKey: ["all-proposals"],
  queryFn: () => fetchAllProposals(get(chainAtom)),
}));

// TODO: this is a bad way to filter/search
export const allProposalsFamily = atomFamily(
  (options?: {
    status?: ProposalStatus;
    type?: ProposalTypeString;
    search?: string;
  }) =>
    atomWithQuery((get) => ({
      queryKey: [
        "all-proposals",
        options?.status,
        options?.type,
        options?.search,
      ],
      queryFn: () =>
        fetchAllProposals(
          get(chainAtom),
          options?.status,
          options?.type,
          options?.search
        ),
    })),
  (a, b) =>
    a?.status === b?.status && a?.type === b?.type && a?.search === b?.search
);

export const votedProposalIdsAtom = atomWithQuery((get) => {
  const account = get(defaultAccountAtom);
  return {
    queryKey: ["voted-proposal-ids"],
    enabled: account.isSuccess,
    queryFn: async () => {
      if (typeof account.data === "undefined") {
        throw new Error("no account found");
      }
      return await fetchVotedProposalIds(get(chainAtom), account.data);
    },
  };
});

type PerformVoteArgs = {
  proposalId: bigint;
  vote: VoteType;
};
export const performVoteAtom = atomWithMutation((get) => {
  const account = get(defaultAccountAtom);
  return {
    enabled: account.isSuccess,
    mutationKey: ["voting"],
    mutationFn: async ({ proposalId, vote }: PerformVoteArgs) => {
      const chain = get(chainAtom);
      if (typeof account.data === "undefined") {
        throw new Error("no account");
      }
      performVote(proposalId, vote, account.data, chain);
    },
  };
});
