/* eslint-disable max-len */
import { useState, useEffect, createContext } from "react";
import { useLocation, Location } from "react-router-dom";
import { createBrowserHistory } from "history";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "styled-components/macro";

// internal
import { Anoma, Keplr } from "@anoma/integrations";
import { chains } from "@anoma/chains";
import {
  getTheme,
  loadColorMode,
  storeColorMode,
  ColorMode,
} from "utils/theme";
import { TopLevelRoute, locationToTopLevelRoute } from "./types";
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
import { Provider } from "react-redux";
import { Toasts } from "components/Toast";

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
  const isStaking = topLevelRoute === TopLevelRoute.StakingAndGovernance;
  return isStaking;
};

type Integrations = Record<string, Anoma | Keplr>;
export const AppContext = createContext<{ integrations: Integrations } | null>(
  null
);

const IntegrationInstances = (() => {
  const instances: Integrations = {};
  let chainId: keyof typeof chains;
  for (chainId in chains) {
    const chain = chains[chainId];
    const extensionId = chain.extension.id;
    switch (extensionId) {
      case "anoma": {
        instances[chainId] = new Anoma(chain);
        break;
      }
      case "keplr": {
        instances[chainId] = new Keplr(chain);
        break;
      }
      default:
        break;
    }
  }
  return instances;
})();

function App(): JSX.Element {
  const initialColorMode = loadColorMode();
  const [colorMode, setColorMode] = useState<ColorMode>(initialColorMode);
  const location = useLocation();
  const ShouldUsePlaceholderTheme = getShouldUsePlaceholderTheme(location);
  const theme = getTheme(colorMode, ShouldUsePlaceholderTheme);

  const toggleColorMode = (): void => {
    setColorMode((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  };

  useEffect(() => storeColorMode(colorMode), [colorMode]);

  return (
    <ThemeProvider theme={theme}>
      <AppContext.Provider value={{ integrations: IntegrationInstances }}>
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
      </AppContext.Provider>
    </ThemeProvider>
  );
}

export default App;
