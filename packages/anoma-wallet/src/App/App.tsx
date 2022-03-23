/* eslint-disable max-len */
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import { AnimatePresence } from "framer-motion";

// internal
import { TopNavigation } from "./TopNavigation";
import { TopLevelRoute } from "./types";
import {
  Settings,
  SettingsAccounts,
  SettingsWalletSettings,
  SettingsAccountSettings,
} from "./Settings";
import { AccountCreation } from "./AccountCreation";
import { StakingAndGovernance } from "./StakingAndGovernance";
import { AccountOverview } from "./AccountOverview";
import {
  AppContainer,
  TopSection,
  BottomSection,
  ContentContainer,
  MotionContainer,
} from "./App.components";
import { ThemeProvider } from "styled-components/macro";
import { darkColors, lightColors, Theme } from "utils/theme";
import { AddAccount } from "./AccountOverview/AddAccount";
import Login from "./Login/Login";
import { store } from "store";

// this sets the dark/light colors to theme
const getTheme = (isLightMode: boolean): Theme => {
  const colors = isLightMode ? lightColors : darkColors;
  const theme: Theme = {
    themeConfigurations: {
      isLightMode: isLightMode,
    },
    colors: colors,
  };
  return theme;
};

const AnimatedTransition = (props: {
  children: React.ReactNode;
  elementKey: string;
}): JSX.Element => {
  const { children, elementKey } = props;
  return (
    <MotionContainer
      key={elementKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </MotionContainer>
  );
};

type ContextType = {
  seed?: string;
  password?: string;
  updateSeed?: (seed: string) => void;
  updatePassword?: (password: string) => void;
};
export const AppContext = React.createContext<ContextType | null>(null);

function App(): JSX.Element {
  const [isLightMode, setIsLightMode] = React.useState(true);
  const [seed, setSeed] = React.useState<string | undefined>();
  const [password, setPassword] = React.useState<string | undefined>();

  const updatePassword = (password: string): void => {
    setPassword(password);
  };

  const updateSeed = (seed: string): void => {
    setSeed(seed);
  };

  const theme = getTheme(isLightMode);
  const fakeAccounts = [
    "fake1l7dgf0m623ayll8vdyf6n7gxm3tz7mt7x443m0",
    "fakej3n4340m623ayll8vdyf6n7gxm3tz7mt74m5th0",
    "fakelg45lt5m623ayll8vdyf6n7gxm3tz7mtrenrer0",
  ];
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AppContext.Provider
          value={{ seed, password, updateSeed, updatePassword }}
        >
          <AppContainer>
            <TopSection>
              <TopNavigation
                isLightMode={isLightMode}
                setIsLightMode={setIsLightMode}
              />
            </TopSection>
            <BottomSection>
              <AnimatePresence exitBeforeEnter>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ContentContainer>
                        <Outlet />
                      </ContentContainer>
                    }
                  >
                    <Route path={""} element={<Login />} />
                    <Route
                      path={`${TopLevelRoute.AccountCreation}/*`}
                      element={
                        <AnimatedTransition
                          elementKey={TopLevelRoute.AccountCreation}
                        >
                          <AccountCreation />
                        </AnimatedTransition>
                      }
                    />
                    <Route
                      path={TopLevelRoute.Wallet}
                      element={
                        <AnimatedTransition elementKey={TopLevelRoute.Wallet}>
                          <Provider store={store}>
                            <AccountOverview />
                          </Provider>
                        </AnimatedTransition>
                      }
                    />
                    <Route
                      path={TopLevelRoute.WalletAddAccount}
                      element={
                        <AnimatedTransition
                          elementKey={TopLevelRoute.WalletAddAccount}
                        >
                          <Provider store={store}>
                            <AddAccount />
                          </Provider>
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
                      path={`${TopLevelRoute.SettingsAccountSettings}/:accountAlias`}
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
              </AnimatePresence>
            </BottomSection>
          </AppContainer>
        </AppContext.Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
