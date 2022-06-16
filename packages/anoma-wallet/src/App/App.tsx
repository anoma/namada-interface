/* eslint-disable max-len */
import { useState, useEffect } from "react";
import {
  unstable_HistoryRouter as HistoryRouter,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { createBrowserHistory } from "history";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "styled-components/macro";

// internal
import { darkColors, lightColors, Theme } from "utils/theme";
import { TopLevelRoute } from "./types";

import { TopNavigation } from "./TopNavigation";
import { AccountCreation } from "./AccountCreation";
import { Login } from "./Login";
import {
  AppContainer,
  TopSection,
  BottomSection,
  ContentContainer,
  MotionContainer,
} from "./App.components";
import { Session } from "lib";
import Redirect from "./Redirect";
import makeStore, { AppStore } from "store/store";
import AppRoutes from "./AppRoutes";
import { Persistor, persistStore } from "redux-persist";

export const history = createBrowserHistory({ window });

// this sets the dark/light colors to theme
export const getTheme = (isLightMode: boolean): Theme => {
  const colors = isLightMode ? lightColors : darkColors;
  const theme: Theme = {
    themeConfigurations: {
      isLightMode: isLightMode,
    },
    colors: colors,
  };
  return theme;
};

export const AnimatedTransition = (props: {
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
  const [isLightMode, setIsLightMode] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [store, setStore] = useState<AppStore>();
  const [persistor, setPersistor] = useState<Persistor>();
  const theme = getTheme(isLightMode);

  useEffect(() => {
    if (store) {
      setPersistor(persistStore(store));
    }
  }, [store]);

  useEffect(() => {
    const { secret } = new Session().getSession() || {};
    if (secret) {
      setIsLoggedIn(true);
      setStore(makeStore(secret));
    }
  }, [isLoggedIn]);

  if (isLoggedIn && store && persistor) {
    return (
      <HistoryRouter history={history}>
        <ThemeProvider theme={theme}>
          <AppContainer>
            <TopSection>
              <TopNavigation
                isLightMode={isLightMode}
                setIsLightMode={setIsLightMode}
                isLoggedIn={isLoggedIn}
                logout={() => setIsLoggedIn(false)}
              />
            </TopSection>
            <BottomSection>
              <AnimatePresence exitBeforeEnter>
                <AppRoutes store={store} persistor={persistor} />
              </AnimatePresence>
            </BottomSection>
          </AppContainer>
        </ThemeProvider>
      </HistoryRouter>
    );
  }

  /**
   * Unlock Wallet & Create Master Seed flow:
   */
  return (
    <HistoryRouter history={history}>
      <ThemeProvider theme={theme}>
        <AppContainer>
          <TopSection>
            <TopNavigation
              isLightMode={isLightMode}
              setIsLightMode={setIsLightMode}
              logout={() => setIsLoggedIn(false)}
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
                    path={""}
                    element={
                      <Login
                        setIsLoggedIn={() => setIsLoggedIn(true)}
                        setStore={(password) => setStore(makeStore(password))}
                      />
                    }
                  />
                  <Route
                    path={`${TopLevelRoute.AccountCreation}/*`}
                    element={
                      <AnimatedTransition
                        elementKey={TopLevelRoute.AccountCreation}
                      >
                        <AccountCreation
                          store={store}
                          setIsLoggedIn={() => setIsLoggedIn(true)}
                          setStore={(password) => setStore(makeStore(password))}
                        />
                      </AnimatedTransition>
                    }
                  />
                  <Route path={"*"} element={<Redirect />} />
                </Route>
              </Routes>
            </AnimatePresence>
          </BottomSection>
        </AppContainer>
      </ThemeProvider>
    </HistoryRouter>
  );
}

export default App;
