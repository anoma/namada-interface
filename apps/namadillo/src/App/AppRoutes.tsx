import { Router } from "@remix-run/router";
import {
  Route,
  Routes,
  ScrollRestoration,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
} from "react-router-dom";
import { AccountOverview } from "./AccountOverview";
import { App } from "./App";
import { RouteErrorBoundary } from "./Common/RouteErrorBoundary";
import { Governance } from "./Governance";
import { SettingsPanel } from "./Settings/SettingsPanel";
import { Staking } from "./Staking";
import { SwitchAccountPanel } from "./SwitchAccount/SwitchAccountPanel";

import GovernanceRoutes from "./Governance/routes";
import SettingsRoutes from "./Settings/routes";
import { SignMessages } from "./SignMessages/SignMessages";
import MessageRoutes from "./SignMessages/routes";
import { StakingRewards } from "./Staking/StakingRewards";
import StakingRoutes from "./Staking/routes";
import SwitchAccountRoutes from "./SwitchAccount/routes";
import { Transfer } from "./Transfer/Transfer";
import TransferRoutes from "./Transfer/routes";

export const MainRoutes = (): JSX.Element => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };

  // Avoid animation being fired twice when navigating inside settings modal routes
  const settingsAnimationKey =
    location.pathname.indexOf(SettingsRoutes.index()) > -1 ?
      "settings-modal"
    : location.pathname;

  return (
    <>
      <Routes location={state?.backgroundLocation || location}>
        <Route path="/" element={<App />} errorElement={<RouteErrorBoundary />}>
          <Route index element={<AccountOverview />} />
          <Route path={`${StakingRoutes.index()}/*`} element={<Staking />} />
          <Route
            path={`${GovernanceRoutes.index()}/*`}
            element={<Governance />}
          />
          <Route path={`${TransferRoutes.index()}/*`} element={<Transfer />} />
        </Route>
      </Routes>
      <Routes location={location} key={settingsAnimationKey}>
        <Route
          path={`${SettingsRoutes.index()}/*`}
          element={<SettingsPanel />}
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path={`${SwitchAccountRoutes.index()}/*`}
          element={<SwitchAccountPanel />}
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path={`${MessageRoutes.index()}/*`}
          element={<SignMessages />}
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path={`${StakingRoutes.claimRewards().url}`}
          element={<StakingRewards />}
        />
      </Routes>
      <ScrollRestoration />
    </>
  );
};

export const getRouter = (): Router => {
  return createBrowserRouter(
    createRoutesFromElements(<Route path="/*" element={<MainRoutes />} />)
  );
};
