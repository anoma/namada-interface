/* eslint-disable max-len */
import { useState, useEffect, createContext } from "react";
import { createBrowserHistory } from "history";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "styled-components";
import { PersistGate } from "redux-persist/integration/react";

import {
  getTheme,
  loadColorMode,
  storeColorMode,
  ColorMode,
} from "@namada/utils";

import { TopNavigation } from "./TopNavigation";
import {
  AppContainer,
  TopSection,
  BottomSection,
  MotionContainer,
  GlobalStyles,
  ContentContainer,
  AppLoader,
} from "./App.components";
import { persistor, store, useAppDispatch, useAppSelector } from "store";
import { Toasts } from "App/Toast";
import { SettingsState } from "slices/settings";
import { chains, defaultChainId } from "@namada/chains";
import {
  useIntegration,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { Outlet } from "react-router-dom";
import { addAccounts, fetchBalances } from "slices/accounts";
import { Account, Chain } from "@namada/types";

export const ChainContext = createContext<Chain | null>(null);
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
  const dispatch = useAppDispatch();
  const initialColorMode = loadColorMode();
  const [colorMode, setColorMode] = useState<ColorMode>(initialColorMode);
  const [chain, setChain] = useState<Chain | null>(null);
  const theme = getTheme(colorMode);

  const toggleColorMode = (): void => {
    setColorMode((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  };

  const { connectedChains } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const defaultChain = chains[defaultChainId];

  const integration = useIntegration(defaultChainId);

  useEffect(() => storeColorMode(colorMode), [colorMode]);

  const extensionAttachStatus = useUntilIntegrationAttached(defaultChain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[defaultChain.extension.id];

  useEffect(() => {
    const fetchAccounts = async (): Promise<void> => {
      const accounts = await integration?.accounts();
      if (accounts) {
        dispatch(addAccounts(accounts as Account[]));
        dispatch(fetchBalances());
      }
    };
    if (
      currentExtensionAttachStatus === "attached" &&
      connectedChains.includes(defaultChainId)
    ) {
      fetchAccounts();
    }
  });

  useEffect(() => {
    (async () => {
      if (currentExtensionAttachStatus === "attached") {
        const chain = await integration.getChain();
        if (chain) {
          setChain(chain);
        }
      }
    })()
  }, [currentExtensionAttachStatus])

  return (
    <ThemeProvider theme={theme}>
      <ChainContext.Provider value={chain}>
        <PersistGate loading={null} persistor={persistor}>
          <Toasts />
          <GlobalStyles colorMode={colorMode} />
          {(currentExtensionAttachStatus === "attached" ||
            currentExtensionAttachStatus === "detached") && (
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
                    <ContentContainer>
                      <Outlet />
                    </ContentContainer>
                  </AnimatePresence>
                </BottomSection>
              </AppContainer>
            )}
          {currentExtensionAttachStatus === "pending" && <AppLoader />}
        </PersistGate>
      </ChainContext.Provider>
    </ThemeProvider>
  );
}

export default App;
