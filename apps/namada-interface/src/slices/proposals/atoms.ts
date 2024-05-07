import { deserialize } from "@dao-xyz/borsh";
import { Proposal as ProposalSchema, Query } from "@namada/shared";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";

import { Proposal, VoteType } from "@namada/types";
import { transparentAccountsAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";
import {
  fetchAllProposals,
  fetchAllProposalsWithExtraInfo,
  fetchProposalStatus,
  fetchProposalVoted,
  fetchProposalVotes,
  performVote,
} from "./functions";

export const currentEpochAtom = atomWithQuery((get) => ({
  queryKey: ["current-epoch"],
  queryFn: async () => {
    const { rpc } = get(chainAtom);
    const query = new Query(rpc);
    return await query.query_epoch();
  },
  //  refetchInterval: 1000
}));

export const proposalCounterAtom = atomWithQuery((get) => ({
  queryKey: ["proposal-counter"],
  queryFn: async () => {
    const { rpc } = get(chainAtom);
    const query = new Query(rpc);
    const proposalCounter = (await query.query_proposal_counter()) as string;
    return Number(proposalCounter);
  },
  //  refetchInterval: 1000
}));

export const proposalFamily = atomFamily((id: number) =>
  atomWithQuery((get) => ({
    queryKey: ["proposal", id],
    queryFn: async (): Promise<Proposal> => {
      const { rpc } = get(chainAtom);
      const query = new Query(rpc);
      const proposalUint8Array = await query.query_proposal_by_id(BigInt(id));
      const deserialized = deserialize(proposalUint8Array, ProposalSchema);

      const content = JSON.parse(deserialized.content);

      return {
        ...deserialized,
        content,
        proposalType: { type: "default" },
      };
    },
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
      queryKey: ["proposal-status", id, currentEpoch.data?.toString()],
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
      currentEpoch.data?.toString(),
    ],
    queryFn: () =>
      fetchAllProposalsWithExtraInfo(
        proposalCounter.data!,
        address,
        currentEpoch.data!
      ),
  };
});

type PerformVoteArgs = {
  proposalId: number;
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
