import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";

import {
  fetchProposals,
  fetchVoted,
  fetchVotes,
  proposalStatus,
} from "./functions";
import * as SimplifiedQueryResult from "./simplifiedQueryResult";

export const proposalsAtom = SimplifiedQueryResult.makeAtom(
  atomWithQuery(() => ({
    queryKey: ["proposals"],
    queryFn: fetchProposals,
  }))
);

export const proposalFamily = atomFamily((id: string) =>
  atom((get) =>
    SimplifiedQueryResult.map(
      (proposals) => proposals.find((p) => p.id === id),
      get(proposalsAtom)
    )
  )
);

export const votesFamily = atomFamily((id: string) =>
  SimplifiedQueryResult.makeAtom(
    atomWithQuery(() => ({
      queryKey: ["votes", id],
      queryFn: () => fetchVotes(id),
    }))
  )
);

export const votedFamily = atomFamily((id: string) =>
  SimplifiedQueryResult.makeAtom(
    atomWithQuery(() => ({
      queryKey: ["voted", id],
      queryFn: () => fetchVoted(id),
    }))
  )
);

export const currentEpochAtom = atom(BigInt(10));

export const statusFamily = atomFamily((id: string) =>
  atom((get) => {
    const proposalQuery = get(proposalFamily(id));
    const votesQuery = get(votesFamily(id));
    const currentEpoch = get(currentEpochAtom);

    return SimplifiedQueryResult.then(proposalQuery, (proposal) =>
      SimplifiedQueryResult.then(votesQuery, (votes) => {
        if (typeof votes === "undefined" || typeof proposal === "undefined") {
          throw new Error("votes or proposal was undefined");
        }

        return SimplifiedQueryResult.resolve(
          proposalStatus(proposal, votes, currentEpoch)
        );
      })
    );
  })
);
