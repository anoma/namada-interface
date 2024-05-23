import { useUntilIntegrationAttached } from "@namada/integrations";
import { getTheme, loadColorMode } from "@namada/utils";
import { Container } from "App/Common/Container";
import { Toasts } from "App/Common/Toast";
import { TopNavigation } from "App/Common/TopNavigation";
import { AnimatePresence } from "framer-motion";
import { createBrowserHistory } from "history";
import { useAtomValue } from "jotai";
import { Outlet } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { chainAtom } from "slices/chain";
import { persistor } from "store";
import { ThemeProvider } from "styled-components";
import { AppLoader, MotionContainer } from "./App.components";
import { Navigation } from "./Common/Navigation";
import {
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
  useOnChainChanged();

  const initialColorMode = loadColorMode();
  const theme = getTheme(initialColorMode);
  const chain = useAtomValue(chainAtom);
  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

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
            navigation={<Navigation />}
            header={<TopNavigation chain={chain} />}
          >
            <AnimatePresence mode="wait">
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
