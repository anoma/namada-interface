import { Query } from "@namada/shared";
import BigNumber from "bignumber.js";
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
  fetchProposalCounter,
  fetchProposalStatus,
  fetchProposalVoted,
  fetchProposalVotes,
  performVote,
} from "./functions";

export const currentEpochAtom = atomWithQuery((get) => ({
  queryKey: ["current-epoch"],
  queryFn: () => fetchCurrentEpoch(get(chainAtom)),
}));

// TODO: move to ./functions.ts
export const totalStakedTokensForProposalFamily = atomFamily(
  (proposalId: bigint) =>
    atomWithQuery((get) => {
      const proposal = get(proposalFamily(proposalId));
      const currentEpoch = get(currentEpochAtom);

      return {
        enabled: proposal.isSuccess && currentEpoch.isSuccess,
        queryKey: [
          "total-staked-tokens-for-proposal",
          proposalId.toString(),
          currentEpoch.data?.toString(),
        ],
        queryFn: async () => {
          const epoch =
            currentEpoch.data! > proposal.data!.endEpoch ?
              proposal.data!.endEpoch
            : currentEpoch.data!;

          const { rpc } = get(chainAtom);
          const query = new Query(rpc);
          const totalStakedTokens: string =
            await query.query_total_staked_tokens(epoch);

          const asBigNumber = BigNumber(totalStakedTokens);
          if (asBigNumber.isNaN()) {
            throw new Error("unable to parse total staked tokens to BigNumber");
          }

          return asBigNumber;
        },
      };
    })
);

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

// TODO: what a horrible name
export const allProposalsWithExtraInfoAtom = atomWithQuery((get) => ({
  queryKey: ["all-proposals-with-extra-info"],
  queryFn: async () => {
    const [account] = get(transparentAccountsAtom);
    if (typeof account === "undefined") {
      throw new Error("no account found");
    }
    return await fetchAllProposalsWithExtraInfo(get(chainAtom), account);
  },
}));

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
