import { Query } from "@namada/shared";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";
import { RootState } from "store";

export type Proposal = {
  id: string;
  proposalType: "pgf_steward" | "pgf_payment" | "default";
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
