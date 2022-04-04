import { Provider } from "react-redux";
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { Persistor, persistStore } from "redux-persist";
import { AccountOverview } from "./AccountOverview";
import { AddAccount } from "./AccountOverview/AddAccount";
import { AnimatedTransition, AppContext } from "./App";
import { ContentContainer } from "./App.components";
import {
  Settings,
  SettingsAccounts,
  SettingsAccountSettings,
  SettingsWalletSettings,
} from "./Settings";
import { StakingAndGovernance } from "./StakingAndGovernance";
import { TopLevelRoute } from "./types";
import { makeStore } from "store";
import { useContext, useEffect, useState } from "react";
import { AppStore } from "store/store";
import { Session } from "lib";
import { TokenDetails } from "./Token";
import { TokenSend } from "./Token/TokenSend";
import { TokenReceive } from "./Token/TokenReceive";

const fakeAccounts = [
  "fake1l7dgf0m623ayll8vdyf6n7gxm3tz7mt7x443m0",
  "fakej3n4340m623ayll8vdyf6n7gxm3tz7mt74m5th0",
  "fakelg45lt5m623ayll8vdyf6n7gxm3tz7mtrenrer0",
];

const AppRoutes = (): JSX.Element => {
  const context = useContext(AppContext);
  const password = context?.password || new Session().secret;
  const [store, setStore] = useState<AppStore>();
  const [persistor, setPersistor] = useState<Persistor>();

  const navigate = useNavigate();

  useEffect(() => {
    if (password === "") {
      Session.logout(() => navigate(TopLevelRoute.Home));
    } else {
      setStore(makeStore(password));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (store) {
      setPersistor(persistStore(store));
    }
  }, [store]);

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
                    {persistor && <AccountOverview persistor={persistor} />}
                  </AnimatedTransition>
                }
              />
              <Route
                path={TopLevelRoute.WalletAddAccount}
                element={
                  <AnimatedTransition
                    elementKey={TopLevelRoute.WalletAddAccount}
                  >
                    <AddAccount />
                  </AnimatedTransition>
                }
              />
              <Route
                path={TopLevelRoute.Token}
                element={
                  <AnimatedTransition elementKey={TopLevelRoute.Token}>
                    {persistor && <TokenDetails persistor={persistor} />}
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
                path={TopLevelRoute.TokenReceive}
                element={
                  <AnimatedTransition elementKey={TopLevelRoute.TokenReceive}>
                    <TokenReceive />
                  </AnimatedTransition>
                }
              />
              <Route
                path={TopLevelRoute.StakingAndGovernance}
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
                path={TopLevelRoute.SettingsAccounts}
                element={
                  <AnimatedTransition
                    elementKey={TopLevelRoute.SettingsAccounts}
                  >
                    <SettingsAccounts accounts={fakeAccounts} />
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
              <Route
                path={TopLevelRoute.SettingsAccountSettings}
                element={
                  <AnimatedTransition
                    elementKey={TopLevelRoute.SettingsWalletSettings}
                  >
                    <SettingsAccountSettings />
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
