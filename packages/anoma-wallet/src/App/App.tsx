/* eslint-disable max-len */
import { lazy, useState, createContext, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "styled-components/macro";

// internal
import { InitialAccount } from "slices/accounts";
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

type ContextType = {
  initialAccount?: InitialAccount;
  seed?: string;
  password?: string;
  setIsInitializing?: (isInitializing: boolean) => void;
  setInitialAccount?: (account: InitialAccount) => void;
  setSeed?: (seed: string) => void;
  setPassword?: (password: string) => void;
  setIsLoggedIn?: () => void;
};

export const AppContext = createContext<ContextType>({});

function App(): JSX.Element {
  const [isLightMode, setIsLightMode] = useState(true);
  const [seed, setSeed] = useState<string>();
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialAccount, setInitialAccount] = useState<InitialAccount>();
  const theme = getTheme(isLightMode);

  useEffect(() => {
    const { secret } = new Session().getSession() || {};
    if (secret) {
      setPassword(secret);
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

  if (isLoggedIn) {
    // Lazy-load Routes as the encrypted persistence layer in Redux
    // requires initialization after a valid password has been entered:
    const AppRoutes = lazy(() => import("./AppRoutes"));

    /**
     * Main wallet
     */
    return (
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AppContext.Provider value={{ initialAccount, seed }}>
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
                  <Suspense fallback={<p>Loading</p>}>
                    <AppRoutes password={password} />
                  </Suspense>
                </AnimatePresence>
              </BottomSection>
            </AppContainer>
          </AppContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );
  }

  /**
   * Unlock Wallet & Create Master Seed flow:
   */
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AppContext.Provider
          value={{
            seed,
            password,
            setInitialAccount: (account) => setInitialAccount(account),
            setSeed: (seed) => setSeed(seed),
            setPassword: (password) => setPassword(password),
            setIsLoggedIn: () => setIsLoggedIn(true),
          }}
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
                    <Route path={"*"} element={<Redirect />} />
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
