import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import { Router } from "@remix-run/router";
import { AccountOverview } from "./AccountOverview";
import App, { AnimatedTransition } from "./App";
import { Bridge } from "./Bridge";
import { Proposals } from "./Proposals";
import { Settings, SettingsWalletSettings } from "./Settings";
import { Staking } from "./Staking";
import StakingRoutes from "./Staking/routes";
import { TokenReceive } from "./Token/TokenReceive";
import { TokenSend } from "./Token/TokenSend";
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
          path={TopLevelRoute.TokenSend}
          element={
            <AnimatedTransition elementKey={TopLevelRoute.TokenSend}>
              <TokenSend />
            </AnimatedTransition>
          }
        />
        <Route
          path={TopLevelRoute.TokenSendTarget}
          element={
            <AnimatedTransition elementKey={TopLevelRoute.TokenSendTarget}>
              <TokenSend />
            </AnimatedTransition>
          }
        />
        <Route
          path={TopLevelRoute.TokenReceive}
          element={
            <AnimatedTransition elementKey={TopLevelRoute.TokenReceive}>
              <TokenReceive />
            </AnimatedTransition>
          }
        />

        <Route
          path={TopLevelRoute.Bridge}
          element={
            <AnimatedTransition elementKey={TopLevelRoute.Bridge}>
              <Bridge />
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
          path={`${TopLevelRoute.Proposals}`}
          element={
            <AnimatedTransition elementKey={TopLevelRoute.Proposals}>
              <Proposals />
            </AnimatedTransition>
          }
        />
        <Route
          path={TopLevelRoute.Settings}
          element={
            <AnimatedTransition elementKey={TopLevelRoute.Settings}>
              <Settings />
            </AnimatedTransition>
          }
        />
        <Route
          path={TopLevelRoute.SettingsWalletSettings}
          element={
            <AnimatedTransition
              elementKey={TopLevelRoute.SettingsWalletSettings}
            >
              <SettingsWalletSettings />
            </AnimatedTransition>
          }
        />
      </Route>
    )
  );
};
