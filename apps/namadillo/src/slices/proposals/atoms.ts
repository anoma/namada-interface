import {
  Proposal,
  ProposalStatus,
  ProposalTypeString,
  VoteType,
} from "@namada/types";
import { useAtomValue } from "jotai";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import { defaultAccountAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";
import {
  fetchAllProposals,
  fetchProposalById,
  fetchProposalVoted,
  fetchVotedProposalIds,
  performVote,
} from "./functions";

import { queryClient } from "store";

export const proposalFamily = atomFamily((id: bigint) =>
  atomWithQuery(() => ({
    queryKey: ["proposal", id.toString()],
    queryFn: () => fetchProposalById(id),
  }))
);

export type StoredProposal = Pick<
  Proposal,
  | "id"
  | "author"
  | "content"
  | "startEpoch"
  | "endEpoch"
  | "activationEpoch"
  | "startTime"
  | "endTime"
  | "currentTime"
  | "proposalType"
  | "tallyType"
> &
  (
    | { status?: undefined }
    | Pick<Proposal, "status" | "yay" | "nay" | "abstain" | "totalVotingPower">
  );

export const proposalFamilyPersist = atomFamily((id: bigint) =>
  atomWithQuery<StoredProposal>(
    (get) => {
      const proposal = get(proposalFamily(id));

      return {
        enabled: proposal.isSuccess,
        queryKey: ["proposal-persist", id.toString()],
        queryFn: async () => {
          const {
            id,
            author,
            content,
            startEpoch,
            endEpoch,
            activationEpoch,
            startTime,
            endTime,
            currentTime,
            proposalType,
            tallyType,
            status,
            yay,
            nay,
            abstain,
            totalVotingPower,
          } = proposal.data!;

          // If proposal is finished, it is safe to store status and voting data
          const finishedProposalProps =
            status === "passed" || status === "rejected" ?
              { status, yay, nay, abstain, totalVotingPower }
            : {};

          return {
            id,
            author,
            content,
            startEpoch,
            endEpoch,
            activationEpoch,
            startTime,
            endTime,
            currentTime,
            proposalType,
            tallyType,
            ...finishedProposalProps,
          };
        },
        meta: { persist: true },
      };
    },
    // TODO: It should be possible to avoid passing queryClient manually
    () => queryClient
  )
);

export const proposalVotedFamily = atomFamily((id: bigint) => {
  const account = useAtomValue(defaultAccountAtom);
  return atomWithQuery(() => ({
    queryKey: ["proposal-voted", id.toString()],
    enabled: account.isSuccess,
    queryFn: async () => {
      if (typeof account.data === "undefined") {
        throw new Error("no account found");
      }
      return await fetchProposalVoted(id, account.data);
    },
  }));
});

export const allProposalsAtom = atomWithQuery(() => ({
  queryKey: ["all-proposals"],
  queryFn: () => fetchAllProposals(),
}));

// TODO: this is a bad way to filter/search
export const allProposalsFamily = atomFamily(
  (options?: {
    status?: ProposalStatus;
    type?: ProposalTypeString;
    search?: string;
  }) =>
    atomWithQuery(() => ({
      queryKey: [
        "all-proposals",
        options?.status,
        options?.type,
        options?.search,
      ],
      queryFn: () => fetchAllProposals(),
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
