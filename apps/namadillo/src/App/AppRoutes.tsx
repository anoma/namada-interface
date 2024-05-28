import { Router } from "@remix-run/router";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { AccountOverview } from "./AccountOverview";
import App from "./App";
import { AnimatedTransition } from "./Common/AnimatedTransition";
import { Governance } from "./Governance";
import GovernanceRoutes from "./Governance/routes";
import { Staking } from "./Staking";
import StakingRoutes from "./Staking/routes";
import { TopLevelRoute } from "./types";

export const getRouter = (): Router => {
  return createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<App />}>
        <Route
          path={TopLevelRoute.Wallet}
          element={
            // eslint-disable-next-line react/jsx-no-undef
            <AnimatedTransition elementKey={TopLevelRoute.Wallet}>
              <AccountOverview />
            </AnimatedTransition>
          }
        />
        <Route
          path={`${StakingRoutes.index()}/*`}
          element={
            <AnimatedTransition elementKey={StakingRoutes.index()}>
              <Staking />
            </AnimatedTransition>
          }
        />
        <Route
          path={`${GovernanceRoutes.index()}/*`}
          element={
            <AnimatedTransition elementKey={GovernanceRoutes.index()}>
              <Governance />
            </AnimatedTransition>
          }
        />
      </Route>
    )
  );
};
