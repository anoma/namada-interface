import { Router } from "@remix-run/router";
import { applicationFeaturesAtom } from "atoms/settings";
import { useAtomValue } from "jotai";
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
import { NotFound } from "./Common/NotFound";
import { RouteErrorBoundary } from "./Common/RouteErrorBoundary";
import { Governance } from "./Governance";
import { GovernanceRoutes } from "./Governance/routes";
import { Ibc } from "./Ibc";
import { IbcRoutes } from "./Ibc/routes";
import { Masp } from "./Masp/Masp";
import { MaspRoutes } from "./Masp/routes";
import { SettingsPanel } from "./Settings/SettingsPanel";
import { SettingsRoutes } from "./Settings/routes";
import { SignMessages } from "./SignMessages/SignMessages";
import { MessageRoutes } from "./SignMessages/routes";
import { Staking } from "./Staking";
import { StakingRewards } from "./Staking/StakingRewards";
import { StakingRoutes } from "./Staking/routes";
import { SwitchAccountPanel } from "./SwitchAccount/SwitchAccountPanel";
import { SwitchAccountRoutes } from "./SwitchAccount/routes";
import { Transfer } from "./Transfer/Transfer";
import { TransferRoutes } from "./Transfer/routes";

export const MainRoutes = (): JSX.Element => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };
  const features = useAtomValue(applicationFeaturesAtom);

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
          <Route path={`${MaspRoutes.index()}/*`} element={<Masp />} />
          <Route path={`${TransferRoutes.index()}/*`} element={<Transfer />} />
          {features.ibcTransfersEnabled && (
            <Route path={`${IbcRoutes.index()}/*`} element={<Ibc />} />
          )}
          <Route path="*" element={<NotFound />} />
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
