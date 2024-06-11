import { Router } from "@remix-run/router";
import { AnimatePresence } from "framer-motion";
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
import { Governance } from "./Governance";
import { SettingsPanel } from "./Settings/SettingsPanel";
import { Staking } from "./Staking";

import GovernanceRoutes from "./Governance/routes";
import SettingsRoutes from "./Settings/routes";
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
        <Route path="/" element={<App />}>
          <Route index element={<AccountOverview />} />
          <Route path={`${StakingRoutes.index()}/*`} element={<Staking />} />
          <Route
            path={`${GovernanceRoutes.index()}/*`}
            element={<Governance />}
          />
        </Route>
      </Routes>
      <AnimatePresence>
        <Routes location={location} key={settingsAnimationKey}>
          <Route
            path={`${SettingsRoutes.index()}/*`}
            element={<SettingsPanel />}
          />
        </Routes>
      </AnimatePresence>
      <ScrollRestoration />
    </>
  );
};

export const getRouter = (): Router => {
  return createBrowserRouter(
    createRoutesFromElements(<Route path="/*" element={<MainRoutes />} />)
  );
};
