import {
  useIntegration,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { Account } from "@namada/types";
import { getTheme, loadColorMode } from "@namada/utils";
import { Container } from "App/Common/Container";
import { Toasts } from "App/Common/Toast";
import { TopNavigation } from "App/Common/TopNavigation";
import { AnimatePresence } from "framer-motion";
import { createBrowserHistory } from "history";
import { useExtensionConnect } from "hooks/useExtensionConnect";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { addAccounts, fetchBalances } from "slices/accounts";
import { chainAtom, setChain } from "slices/chain";
import { SettingsState } from "slices/settings";
import { persistor, useAppDispatch, useAppSelector } from "store";
import { ThemeProvider } from "styled-components";
import { AppLoader, MotionContainer } from "./App.components";
import { Sidebar } from "./Common/Sidebar";
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
  const theme = getTheme(initialColorMode);
  const chain = useAtomValue(chainAtom);
  const { connectedChains } = useAppSelector<SettingsState>(
    (state) => state.settings
  );

  const { connectionStatus, connect } = useExtensionConnect(chain);

  const integration = useIntegration(chain.id);
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

  const extensionReady =
    currentExtensionAttachStatus === "attached" ||
    currentExtensionAttachStatus === "detached";

  const extensionLoading = currentExtensionAttachStatus === "pending";

  return (
    <ThemeProvider theme={theme}>
      <PersistGate loading={null} persistor={persistor}>
        <Toasts />
        {extensionReady && (
          <Container
            data-testid="AppContainer"
            sidebar={<Sidebar />}
            header={
              <TopNavigation chain={chain} isExtensionConnected={false} />
            }
          >
            <AnimatePresence exitBeforeEnter>
              <Outlet />
            </AnimatePresence>
          </Container>
        )}
        {extensionLoading && <AppLoader />}
      </PersistGate>
    </ThemeProvider>
  );
}

export default App;
