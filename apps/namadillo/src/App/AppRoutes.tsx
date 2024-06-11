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
import { Governance } from "./Governance";
import { SettingsPanel } from "./Settings/SettingsPanel";
import { Staking } from "./Staking";

import GovernanceRoutes from "./Governance/routes";
import SettingsRoutes from "./Settings/routes";
import StakingRoutes from "./Staking/routes";

export const MainRoutes = (): JSX.Element => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };

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
      <Routes>
        <Route
          path={`${SettingsRoutes.index()}/*`}
          element={<SettingsPanel />}
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
