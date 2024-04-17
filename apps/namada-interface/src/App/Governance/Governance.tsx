import { useSanitizedLocation } from "@namada/hooks";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { GovernanceOverview } from "./GovernanceOverview";
import { ProposalAndVote } from "./ProposalAndVote";
import GovernanceRoutes from "./routes";

export const Governance: React.FC = () => {
  const navigate = useNavigate();
  const location = useSanitizedLocation();

  // from outside this view we just navigate here
  // this view decides what is the default view
  useEffect(() => {
    if (location.pathname === GovernanceRoutes.index()) {
      navigate(GovernanceRoutes.overview().url);
    }
  }, [location.pathname]);

  return (
    <main className="w-full">
      <Routes>
        <Route
          path={`${GovernanceRoutes.overview()}`}
          element={<GovernanceOverview />}
        />
        <Route
          path={`${GovernanceRoutes.proposal("862")}`}
          element={<ProposalAndVote />}
        />
      </Routes>
    </main>
  );
};
