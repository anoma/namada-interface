import { chains } from "@namada/chains";
import { Query } from "@namada/shared";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";
import { RootState } from "store";

//TODO: change case in those types
export type Proposal = {
  id: string;
  proposalType: string;
  author: string;
  startEpoch: bigint;
  endEpoch: bigint;
  graceEpoch: bigint;
  content: Content;
  status: string;
  yesVotes?: string;
  totalVotingPower?: string;
  result?: string;
};

export type Content = {
  abstract: string;
  authors: string;
  created: string;
  details: string;
  discussionsTo: string;
  license: string;
  motivation: string;
  requires: string;
  title: string;
};

export type ProposalsState = {
  proposals: Proposal[];
  active?: {
    proposalId: string;
    delegations: Record<string, BigNumber>;
  };
};

const PROPOSALS_ACTIONS_BASE = "proposals";
const INITIAL_STATE: ProposalsState = {
  proposals: [],
};

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
    const state = thunkApi.getState();
    const chainId = state.settings.chainId;
    const { rpc } = chains[chainId];
    const query = new Query(rpc);
    let proposals: Proposal[] = [];

    try {
      const sdkProposals = await query.query_proposals();
      proposals = sdkProposals.map((p) => ({
        ...p,
        proposalType: p.proposal_type,
        startEpoch: BigInt(p.start_epoch),
        endEpoch: BigInt(p.end_epoch),
        graceEpoch: BigInt(p.grace_epoch),
        content: { ...p.content, discussionsTo: p.content["discussions-to"] },
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
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProposals.fulfilled, (state, action) => {
      state.proposals = action.payload;
    });
  },
});

const { reducer } = proposalsSlice;

export default reducer;
