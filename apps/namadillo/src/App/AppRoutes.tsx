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

import GovernanceRoutes from "./Governance/routes";
import SettingsRoutes from "./Settings/routes";
import { SignMessages } from "./SignMessages/SignMessages";
import MessageRoutes from "./SignMessages/routes";
import StakingRoutes from "./Staking/routes";

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
        </Route>
      </Routes>
      <Routes location={location} key={settingsAnimationKey}>
        <Route
          path={`${SettingsRoutes.index()}/*`}
          element={<SettingsPanel />}
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path={`${MessageRoutes.index()}/*`}
          element={<SignMessages />}
          errorElement={<RouteErrorBoundary />}
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
