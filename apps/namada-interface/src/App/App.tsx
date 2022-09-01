/* eslint-disable max-len */
import { useState, useEffect } from "react";
import { Routes, Route, Outlet, useLocation, Location } from "react-router-dom";
import { createBrowserHistory } from "history";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "styled-components/macro";

// internal
import { getTheme } from "utils/theme";
import { TopLevelRoute, locationToTopLevelRoute } from "./types";

import { TopNavigation } from "./TopNavigation";
import { AccountCreation } from "./AccountCreation";
import { Login } from "./Login";
import {
  AppContainer,
  TopSection,
  BottomSection,
  ContentContainer,
  MotionContainer,
  GlobalStyles,
} from "./App.components";
import Redirect from "./Redirect";
import makeStore, { AppStore } from "store/store";
import AppRoutes from "./AppRoutes";
import { Persistor, persistStore } from "redux-persist";
import { Provider } from "react-redux";

export const history = createBrowserHistory({ window });

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

// based on location we decide whether to use placeholder theme
const getShouldUsePlaceholderTheme = (location: Location): boolean => {
  const topLevelRoute = locationToTopLevelRoute(location);
  const isStaking = topLevelRoute === TopLevelRoute.Staking;
  return isStaking;
};

function App(): JSX.Element {
  const [isLightMode, setIsLightMode] = useState(true);
  const location = useLocation();
  const [password, setPassword] = useState<string>();
  const [store, setStore] = useState<AppStore>();
  const [persistor, setPersistor] = useState<Persistor>();

  const ShouldUsePlaceholderTheme = getShouldUsePlaceholderTheme(location);
  const theme = getTheme(isLightMode, ShouldUsePlaceholderTheme);

  useEffect(() => {
    if (store) {
      setPersistor(persistStore(store));
    }
  }, [store]);

  if (password && store && persistor) {
    return (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <GlobalStyles isLightMode={isLightMode} />
          <AppContainer data-testid="AppContainer">
            <TopSection>
              <TopNavigation
                isLightMode={isLightMode}
                setIsLightMode={setIsLightMode}
                isLoggedIn={!!password}
                persistor={persistor}
                store={store}
                logout={() => setPassword(undefined)}
              />
            </TopSection>
            <BottomSection>
              <AnimatePresence exitBeforeEnter>
                <AppRoutes
                  store={store}
                  persistor={persistor}
                  password={password}
                />
              </AnimatePresence>
            </BottomSection>
          </AppContainer>
        </Provider>
      </ThemeProvider>
    );
  }

  /**
   * Unlock Wallet & Create Master Seed flow:
   */
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles isLightMode={isLightMode} />
      <AppContainer data-testid="AppContainer">
        <TopSection>
          <TopNavigation
            isLightMode={isLightMode}
            setIsLightMode={setIsLightMode}
            logout={() => setPassword(undefined)}
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
                      setPassword={setPassword}
                      // set store is dehydrating the whole
                      // state once the user gives a password
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
                        setPassword={setPassword}
                        setStore={(password) => setStore(makeStore(password))}
                      />
                    </AnimatedTransition>
                  }
                />
                <Route path={"*"} element={<Redirect password={password} />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </BottomSection>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
