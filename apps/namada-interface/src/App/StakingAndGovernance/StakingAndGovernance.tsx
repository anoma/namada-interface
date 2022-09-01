import { useEffect } from "react";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { StakingAndGovernanceContainer } from "./StakingAndGovernance.components";
import {
  TopLevelRoute,
  StakingAndGovernanceSubRoute,
  locationToStakingAndGovernanceSubRoute,
} from "App/types";
export const StakingAndGovernance = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  // we need one of the sub routes, staking alone has nothing
  const stakingAndGovernanceSubRoute =
    locationToStakingAndGovernanceSubRoute(location);
  useEffect(() => {
    if (!!!stakingAndGovernanceSubRoute) {
      navigate(
        `${TopLevelRoute.Staking}${StakingAndGovernanceSubRoute.Staking}`
      );
    }
  });

  return (
    <StakingAndGovernanceContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Staking & Governance</Heading>
      </NavigationContainer>
      <Routes>
        <Route path="*" element={<div>*</div>} />
        <Route
          path={StakingAndGovernanceSubRoute.Staking}
          element={
            <div style={{ color: "white" }}>
              StakingAndGovernanceSubRoute.Staking
            </div>
          }
        />
        <Route
          path={StakingAndGovernanceSubRoute.Governance}
          element={
            <div style={{ color: "white" }}>
              StakingAndGovernanceSubRoute.Governance
            </div>
          }
        />
        <Route
          path={StakingAndGovernanceSubRoute.PublicGoodsFunding}
          element={
            <div style={{ color: "white" }}>
              StakingAndGovernanceSubRoute.PublicGoodsFunding
            </div>
          }
        />
      </Routes>
      <a
        href="https://github.com/anoma/spec/blob/master/src/architecture/namada/web-wallet/user-interfaces.md#stakingandgovernance-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        StakingAndGovernance
      </a>
    </StakingAndGovernanceContainer>
  );
};
