import { Provider } from "react-redux";
import { Routes, Route, Outlet } from "react-router-dom";

import { AccountOverview } from "./AccountOverview";
import { AnimatedTransition } from "./App";
import { ContentContainer } from "./App.components";
import { Settings, SettingsWalletSettings } from "./Settings";
import { Bridge } from "./Bridge";
import { StakingAndGovernance } from "./StakingAndGovernance";
import { TopLevelRoute } from "./types";
import { AppStore } from "store/store";
import { TokenDetails } from "./Token";
import { TokenSend } from "./Token/TokenSend";
import { TokenReceive } from "./Token/TokenReceive";
import { TransferDetails, Transfers } from "./Token/Transfers";

type Props = {
  store: AppStore;
};

const AppRoutes = ({ store }: Props): JSX.Element => {
  return (
    <>
      {store && (
        <Provider store={store}>
          <Routes>
            <Route
              path="/"
              element={
                <ContentContainer>
                  <Outlet />
                </ContentContainer>
              }
            >
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
                path={TopLevelRoute.Token}
                element={
                  <AnimatedTransition elementKey={TopLevelRoute.Token}>
                    <TokenDetails />
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
                  <AnimatedTransition
                    elementKey={TopLevelRoute.TokenSendTarget}
                  >
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
                path={TopLevelRoute.TokenTransfers}
                element={
                  <AnimatedTransition elementKey={TopLevelRoute.TokenTransfers}>
                    <Transfers />
                  </AnimatedTransition>
                }
              />
              <Route
                path={TopLevelRoute.TokenTransferDetails}
                element={
                  <AnimatedTransition
                    elementKey={TopLevelRoute.TokenTransferDetails}
                  >
                    <TransferDetails />
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
                path={`${TopLevelRoute.StakingAndGovernance}/*`}
                element={
                  <AnimatedTransition
                    elementKey={TopLevelRoute.StakingAndGovernance}
                  >
                    <StakingAndGovernance />
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
          </Routes>
        </Provider>
      )}
    </>
  );
};

export default AppRoutes;
