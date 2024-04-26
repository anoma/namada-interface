import { Query } from "@namada/shared";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";
import { RootState } from "store";

import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

import { mapUndefined } from "@namada/utils";

export const proposalStatuses = [
  "upcoming",
  "ongoing",
  "passed",
  "rejected",
] as const;

export type ProposalStatus = (typeof proposalStatuses)[number];

export type ProposalType = "pgf_steward" | "pgf_payment" | "default";

export const voteTypes = ["yes", "no", "veto", "abstain"];
export type VoteType = (typeof voteTypes)[number];

export type Votes = Record<VoteType, BigNumber>;

export type ProposalWithVotingInfo = _Proposal & {
  status: ProposalStatus;
  voted: boolean;
};

export type Proposal = {
  id: string;
  proposalType: ProposalType;
  author: string;
  startEpoch: bigint;
  endEpoch: bigint;
  graceEpoch: bigint;
  content: Partial<{ [key: string]: string }>;
  status: "ongoing" | "finished" | "upcoming";
  result: string;
  totalVotingPower: BigNumber;
  totalYayPower: BigNumber;
  totalNayPower: BigNumber;
};

export type ProposalsState = {
  proposals: Proposal[];
  activeProposalId?: string;
};
const PROPOSALS_ACTIONS_BASE = "proposals";
const INITIAL_STATE: ProposalsState = { proposals: [] };

enum ProposalsActions {
  FetchProposals = "fetchProposals",
}

export const fetchProposals = createAsyncThunk<
  Proposal[],
  void,
  { state: RootState }
>(
  `${PROPOSALS_ACTIONS_BASE}/${ProposalsActions.FetchProposals}`,
  async (_, thunkApi) => {
    const { rpc } = thunkApi.getState().chain.config;
    const query = new Query(rpc);
    let proposals: Proposal[] = [];

    try {
      const sdkProposals = await query.queryProposals();

      proposals = sdkProposals.map((proposal) => ({
        ...proposal,
        content: JSON.parse(proposal.contentJSON) as Record<string, string>,
      }));
    } catch (e) {
      console.error(e);
    }

    return proposals;
  }
);

const proposalsSlice = createSlice({
  name: PROPOSALS_ACTIONS_BASE,
  initialState: INITIAL_STATE,
  reducers: {
    setActiveProposal: (state, action: PayloadAction<string | undefined>) => {
      state.activeProposalId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProposals.fulfilled, (state, action) => {
      state.proposals = action.payload;
    });
  },
});

const { reducer, actions } = proposalsSlice;

export const { setActiveProposal } = actions;

export default reducer;

////////////////////////////////////////////////////////////////////////////////
// JOTAI
////////////////////////////////////////////////////////////////////////////////

export type _Proposal = {
  id: string;
  content: { [key: string]: string | undefined };
  startEpoch: bigint;
  endEpoch: bigint;
  graceEpoch: bigint;
  proposalType: ProposalType;
};

export const proposalsAtom = atom<_Proposal[]>([
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
]);

export const proposalIdsAtom = atom((get) =>
  get(proposalsAtom).map((proposal) => proposal.id)
);

export const proposalsGroupedByStatusAtom = atom<
  Record<ProposalStatus, _Proposal[]>
>((get) => {
  const proposals = get(proposalsAtom);
  const currentEpoch = get(currentEpochAtom);

  // TODO: this is probably not correct as proposals that have reached the
  // vote threshold are still classed as ongoing before the end epoch
  return proposals.reduce(
    (acc, curr) => {
      const status = proposalStatus(curr, null as any as Votes, currentEpoch);

      return { ...acc, [status]: [...acc[status], curr] };
    },
    { upcoming: [], ongoing: [], passed: [], rejected: [] }
  );
});

export const liveProposalsAtom = atom((get) => {
  const currentEpoch = get(currentEpochAtom);
  const proposals = get(proposalsAtom);

  return proposals.filter(
    ({ startEpoch, endEpoch }) =>
      startEpoch <= currentEpoch && endEpoch > currentEpoch
  );
});

export const upcomingProposalsAtom = atom((get) => {
  const currentEpoch = get(currentEpochAtom);
  const proposals = get(proposalsAtom);

  return proposals.filter(({ startEpoch }) => startEpoch > currentEpoch);
});

export const votedProposalsAtom = atom((get) => {
  const proposalIds = get(proposalIdsAtom);

  return proposalIds.filter((id, index) => index % 2 === 0);
});

export const votesAtom = atom((get) => {
  const proposalIds = get(proposalIdsAtom);

  return proposalIds.reduce<{ [id: string]: Votes | undefined }>(
    (acc, id) => ({
      ...acc,
      [id]: {
        yes: BigNumber(1000.22),
        no: BigNumber(325.111),
        veto: BigNumber(44.22),
        abstain: BigNumber(133.00002),
      },
    }),
    {}
  );
});

export const currentEpochAtom = atom(BigInt(10));

export const proposalStatus = (
  proposal: _Proposal,
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

export const proposalFamily = atomFamily((id: string) =>
  atom((get) => {
    const proposals = get(proposalsAtom);
    return proposals.find((p) => p.id === id);
  })
);

export const statusFamily = atomFamily((id: string) =>
  atom((get) => {
    const currentEpoch = get(currentEpochAtom);
    const votes = null as any as Votes;
    const maybeProposal = get(proposalFamily(id));

    return mapUndefined(
      (proposal) => proposalStatus(proposal, votes, currentEpoch),
      maybeProposal
    );
  })
);
