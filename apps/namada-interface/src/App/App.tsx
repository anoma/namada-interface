/* eslint-disable max-len */
import { AnimatePresence } from "framer-motion";
import { createBrowserHistory } from "history";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "styled-components";

import {
  ColorMode,
  getTheme,
  loadColorMode,
  storeColorMode,
} from "@namada/utils";

import {
  useIntegration,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { Account } from "@namada/types";
import { Toasts } from "App/Toast";
import { Outlet } from "react-router-dom";
import { addAccounts, fetchBalances } from "slices/accounts";
import { setChain } from "slices/chain";
import { SettingsState } from "slices/settings";
import { persistor, store, useAppDispatch, useAppSelector } from "store";
import {
  AppContainer,
  AppLoader,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  MotionContainer,
  TopSection,
} from "./App.components";
import { TopNavigation } from "./TopNavigation";

import { chainAtom } from "slices/chain";

import {
  useOnAccountsChanged,
  useOnChainChanged,
  useOnNamadaExtensionAttached,
  useOnNamadaExtensionConnected,
} from "./fetchEffects";

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
  useOnNamadaExtensionAttached();
  useOnNamadaExtensionConnected();
  useOnAccountsChanged();
  useOnChainChanged();

  const dispatch = useAppDispatch();
  const initialColorMode = loadColorMode();
  const [colorMode, setColorMode] = useState<ColorMode>(initialColorMode);
  const theme = getTheme(colorMode);

  const toggleColorMode = (): void => {
    setColorMode((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  };

  const chain = useAtomValue(chainAtom);

  const { connectedChains } = useAppSelector<SettingsState>(
    (state) => state.settings
  );

  const integration = useIntegration(chain.id);

  useEffect(() => storeColorMode(colorMode), [colorMode]);

  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  // TODO: remove this effect once redux has been replaced by jotai
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
      connectedChains.includes(chain.id)
    ) {
      fetchAccounts();
    }
  }, [chain]);

  // TODO: remove this effect once redux has been replaced by jotai
  useEffect(() => {
    (async () => {
      if (currentExtensionAttachStatus === "attached") {
        const chain = await integration.getChain();
        if (chain) {
          dispatch(setChain(chain));
        }
      }
    })();
  }, [currentExtensionAttachStatus]);

  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
}

export default App;
