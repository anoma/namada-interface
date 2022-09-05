import { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { Staking } from "App/Staking";
import { Governance } from "App/Governance";
import { PublicGoodsFunding } from "App/PublicGoodsFunding";
import { StakingAndGovernanceContainer } from "./StakingAndGovernance.components";
import {
  TopLevelRoute,
  StakingAndGovernanceSubRoute,
  locationToStakingAndGovernanceSubRoute,
} from "App/types";

// This is just rendering the actual Staking/Governance/PGF screens
// mostly the purpose of this is to define the default behavior when
// the user clicks the top level Staking & Governance menu
export const StakingAndGovernance = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  // we need one of the sub routes, staking alone has nothing
  const stakingAndGovernanceSubRoute =
    locationToStakingAndGovernanceSubRoute(location);

  // from outside this view we just navigate here
  // this view decides what is the default view
  useEffect(() => {
    if (!!!stakingAndGovernanceSubRoute) {
      navigate(
        `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.StakingOverview}`
      );
    }
  });

  return (
    <StakingAndGovernanceContainer>
      <Routes>
        <Route
          path={`${StakingAndGovernanceSubRoute.Staking}/*`}
          element={<Staking />}
        />
        <Route
          path={StakingAndGovernanceSubRoute.Governance}
        />
        <Route
          path={StakingAndGovernanceSubRoute.PublicGoodsFunding}
          element={<PublicGoodsFunding />}
        />
      </Routes>
    </StakingAndGovernanceContainer>
  );
};
