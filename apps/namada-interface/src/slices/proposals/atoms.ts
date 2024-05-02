import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";

import {
  fetchAllProposals,
  fetchAllProposalsWithExtraInfo,
  fetchCurrentEpoch,
  fetchProposalById,
  fetchProposalCounter,
  fetchProposalStatus,
  fetchProposalVoted,
  fetchProposalVotes,
} from "./functions";

export const currentEpochAtom = atomWithQuery(() => ({
  queryKey: ["current-epoch"],
  queryFn: fetchCurrentEpoch,
}));

export const proposalCounterAtom = atomWithQuery(() => ({
  queryKey: ["proposal-counter"],
  queryFn: fetchProposalCounter,
}));

export const proposalFamily = atomFamily((id: number) =>
  atomWithQuery(() => ({
    queryKey: ["proposal", id],
    queryFn: () => fetchProposalById(id),
  }))
);

export const proposalVotesFamily = atomFamily((id: number) =>
  atomWithQuery(() => ({
    queryKey: ["proposal-votes", id],
    queryFn: () => fetchProposalVotes(id),
  }))
);

export const proposalStatusFamily = atomFamily((id: number) =>
  atomWithQuery((get) => {
    const currentEpoch = get(currentEpochAtom);
    return {
      enabled: currentEpoch.isSuccess,
      queryKey: ["proposal-status", id, currentEpoch.data],
      queryFn: () => fetchProposalStatus(id, currentEpoch.data!),
    };
  })
);

export const proposalVotedFamily = atomFamily((id: number) =>
  atomWithQuery((get) => {
    const address = "tnam1qz4sdx5jlh909j44uz46pf29ty0ztftfzc98s8dx";
    return {
      queryKey: ["proposal-voted", id, address],
      queryFn: () => fetchProposalVoted(id, address),
    };
  })
);

export const allProposalsAtom = atomWithQuery((get) => {
  const proposalCounter = get(proposalCounterAtom);
  return {
    enabled: proposalCounter.isSuccess,
    queryKey: ["all-proposals", proposalCounter.data],
    queryFn: () => fetchAllProposals(proposalCounter.data!),
  };
});

// TODO: what a horrible name
export const allProposalsWithExtraInfoAtom = atomWithQuery((get) => {
  const proposalCounter = get(proposalCounterAtom);
  const address = "tnam1qz4sdx5jlh909j44uz46pf29ty0ztftfzc98s8dx";
  const currentEpoch = get(currentEpochAtom);
  return {
    enabled: proposalCounter.isSuccess && currentEpoch.isSuccess,
    queryKey: [
      "all-proposals-with-voted-and-status",
      proposalCounter.data,
      currentEpoch.data,
    ],
    queryFn: () =>
      fetchAllProposalsWithExtraInfo(
        proposalCounter.data!,
        address,
        currentEpoch.data!
      ),
  };
});
