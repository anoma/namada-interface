import { NotFound } from "App/Common/NotFound";
import { Route, Routes } from "react-router-dom";
import { GovernanceOverview } from "./GovernanceOverview";
import { ProposalAndVote } from "./ProposalAndVote";
import { SubmitVote } from "./SubmitVote";
import { ViewJson } from "./ViewJson";
import { GovernanceRoutes } from "./routes";

export const Governance: React.FC = () => (
  <Routes>
    <Route
      path={`${GovernanceRoutes.overview()}`}
      element={<GovernanceOverview />}
    />
    <Route
      path={`${GovernanceRoutes.proposal()}`}
      element={<ProposalAndVote />}
    />
    <Route path={`${GovernanceRoutes.submitVote()}`} element={<SubmitVote />} />
    <Route path={`${GovernanceRoutes.viewJson()}`} element={<ViewJson />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
