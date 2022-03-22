/* eslint-disable max-len */
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// internal
import { TopNavigation } from "./TopNavigation";
// import { AccountCreation } from "./AccountCreation";
import { TopLevelRoute } from "./types";
import {
  Settings,
  SettingsAccounts,
  SettingsWalletSettings,
  SettingsAccountSettings,
  SettingsAccountCreation,
} from "./Settings";
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

function App(): JSX.Element {
  const [isLightMode, setIsLightMode] = React.useState(true);
  const theme = getTheme(isLightMode);
  const fakeAccounts = [
    "fake1l7dgf0m623ayll8vdyf6n7gxm3tz7mt7x443m0",
    "fakej3n4340m623ayll8vdyf6n7gxm3tz7mt74m5th0",
    "fakelg45lt5m623ayll8vdyf6n7gxm3tz7mtrenrer0",
  ];
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
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
                    <Route
                      path={TopLevelRoute.Wallet}
                      element={
                        <AnimatedTransition elementKey={TopLevelRoute.Wallet}>
                          <AccountOverview />
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
                    <Route
                      path={`${TopLevelRoute.SettingsAccountCreation}/*`}
                      element={
                        <AnimatedTransition
                          elementKey={TopLevelRoute.SettingsAccountCreation}
                        >
                          <SettingsAccountCreation />
                        </AnimatedTransition>
                      }
                    />
                  </Route>
                </Routes>
              </AnimatePresence>
            </BottomSection>
          </AppContainer>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
