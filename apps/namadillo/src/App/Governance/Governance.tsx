import { Route, Routes } from "react-router-dom";
import { GovernanceOverview } from "./GovernanceOverview";
import { ProposalAndVote } from "./ProposalAndVote";
import { SubmitVote } from "./SubmitVote";
import { ViewJson } from "./ViewJson";
import GovernanceRoutes from "./routes";

export const Governance: React.FC = () => (
  <main className="w-full">
    <Routes>
      <Route path="/*" element={<GovernanceOverview />} />
      <Route
        path={`${GovernanceRoutes.proposal()}`}
        element={<ProposalAndVote />}
      />
      <Route
        path={`${GovernanceRoutes.submitVote()}`}
        element={<SubmitVote />}
      />
      <Route path={`${GovernanceRoutes.viewJson()}`} element={<ViewJson />} />
    </Routes>
  </main>
);
