import { useUntilIntegrationAttached } from "@namada/integrations";
import { Container } from "App/Common/Container";
import { Toasts } from "App/Common/Toast";
import { TopNavigation } from "App/Common/TopNavigation";
import { AnimatePresence } from "framer-motion";
import { createBrowserHistory } from "history";
import { useOnChainChanged } from "hooks/useOnChainChanged";
import { useOnNamadaExtensionAttached } from "hooks/useOnNamadaExtensionAttached";
import { useOnNamadaExtensionConnected } from "hooks/useOnNamadaExtensionConnected";
import { useTransactionCallback } from "hooks/useTransactionCallbacks";
import { useTransactionNotifications } from "hooks/useTransactionNotifications";
import { useAtomValue } from "jotai";
import { Outlet } from "react-router-dom";
import { chainAtom } from "slices/chain";
import { Navigation } from "./Common/Navigation";

export const history = createBrowserHistory({ window });

export function App(): JSX.Element {
  useOnNamadaExtensionAttached();
  useOnNamadaExtensionConnected();
  useOnChainChanged();
  useTransactionNotifications();
  useTransactionCallback();

  const chain = useAtomValue(chainAtom);
  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];
  const extensionReady =
    currentExtensionAttachStatus === "attached" ||
    currentExtensionAttachStatus === "detached";

  return (
    <>
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
    </>
  );
}
