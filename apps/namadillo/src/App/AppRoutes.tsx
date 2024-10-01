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
import { GovernanceOverview } from "./Governance/GovernanceOverview";
import { ProposalAndVote } from "./Governance/ProposalAndVote";
import { SubmitVote } from "./Governance/SubmitVote";
import { ViewJson } from "./Governance/ViewJson";
import { IbcLayout } from "./Ibc/IbcLayout";
import { IbcShieldAll } from "./Ibc/IbcShieldAll";
import { IbcTransfer } from "./Ibc/IbcTransfer";
import { IbcWithdraw } from "./Ibc/IbcWithdraw";
import { MaspLayout } from "./Masp/MaspLayout";
import { MaspOverview } from "./Masp/MaspOverview";
import { MaspShield } from "./Masp/MaspShield";
import { MaspUnshield } from "./Masp/MaspUnshield";
import { SettingsPanel } from "./Settings/SettingsPanel";
import { SettingsRoutes } from "./Settings/routes";
import { SignMessages } from "./SignMessages/SignMessages";
import { MessageRoutes } from "./SignMessages/routes";
import IncrementBonding from "./Staking/IncrementBonding";
import { ReDelegate } from "./Staking/ReDelegate";
import { StakingOverview } from "./Staking/StakingOverview";
import { StakingRewards } from "./Staking/StakingRewards";
import { Unstake } from "./Staking/Unstake";
import { SwitchAccountPanel } from "./SwitchAccount/SwitchAccountPanel";
import { SwitchAccountRoutes } from "./SwitchAccount/routes";
import { NamTransfer } from "./Transfer/NamTransfer";
import { TransferLayout } from "./Transfer/TransferLayout";
import { routes } from "./routes";

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
          <Route path={routes.staking} element={<StakingOverview />} />
          <Route
            path={routes.stakingBondingIncrement}
            element={<IncrementBonding />}
          />
          <Route path={routes.stakingBondingUnstake} element={<Unstake />} />
          <Route
            path={routes.stakingBondingRedelegate}
            element={<ReDelegate />}
          />
          <Route path={routes.governance} element={<GovernanceOverview />} />
          <Route
            path={routes.governanceProposal}
            element={<ProposalAndVote />}
          />
          <Route path={routes.governanceSubmitVote} element={<SubmitVote />} />
          <Route path={routes.governanceJson} element={<ViewJson />} />
          {features.maspEnabled && (
            <Route element={<MaspLayout />}>
              <Route path={routes.masp} element={<MaspOverview />} />
              <Route path={routes.maspShield} element={<MaspShield />} />
              <Route path={routes.maspUnshield} element={<MaspUnshield />} />
            </Route>
          )}
          {features.ibcTransfersEnabled && (
            <Route element={<IbcLayout />}>
              <Route path={routes.ibc} element={<IbcTransfer />} />
              <Route path={routes.ibcWithdraw} element={<IbcWithdraw />} />
              <Route path={routes.ibcShieldAll} element={<IbcShieldAll />} />
            </Route>
          )}
          {features.namTransfersEnabled && (
            <Route element={<TransferLayout />}>
              <Route path={routes.transfer} element={<NamTransfer />} />
            </Route>
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
        <Route path={routes.stakingClaimRewards} element={<StakingRewards />} />
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
