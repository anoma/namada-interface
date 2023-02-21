/* eslint-disable max-len */
import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { createBrowserHistory } from "history";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "styled-components";

import {
  getTheme,
  loadColorMode,
  storeColorMode,
  ColorMode,
} from "@anoma/utils";

import { TopNavigation } from "./TopNavigation";
import {
  AppContainer,
  TopSection,
  BottomSection,
  MotionContainer,
  GlobalStyles,
} from "./App.components";
import store from "store/store";
import AppRoutes from "./AppRoutes";
import { Toasts } from "App/Toast";
import { IntegrationsProvider } from "services";

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

function App(): JSX.Element {
  const initialColorMode = loadColorMode();
  const [colorMode, setColorMode] = useState<ColorMode>(initialColorMode);
  const theme = getTheme(colorMode);

  const toggleColorMode = (): void => {
    setColorMode((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  };

  useEffect(() => storeColorMode(colorMode), [colorMode]);

  return (
    <ThemeProvider theme={theme}>
      <IntegrationsProvider>
        <Provider store={store}>
          <Toasts />
          <GlobalStyles colorMode={colorMode} />
          <AppContainer data-testid="AppContainer">
            <TopSection>
              <TopNavigation
                colorMode={colorMode}
                toggleColorMode={toggleColorMode}
                setColorMode={setColorMode}
                store={store}
              />
            </TopSection>
            <BottomSection>
              <AnimatePresence exitBeforeEnter>
                <AppRoutes store={store} />
              </AnimatePresence>
            </BottomSection>
          </AppContainer>
        </Provider>
      </IntegrationsProvider>
    </ThemeProvider>
  );
}

export default App;
