import { AppContainer } from "App/Common/AppContainer";
import { Toasts } from "App/Common/Toast";
import { TopNavigation } from "App/Common/TopNavigation";
import { createBrowserHistory } from "history";
import { useExtensionEvents } from "hooks/useExtensionEvents";
import { useOnNamadaExtensionAttached } from "hooks/useOnNamadaExtensionAttached";
import { useTransactionCallback } from "hooks/useTransactionCallbacks";
import { useTransactionNotifications } from "hooks/useTransactionNotifications";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Common/Navigation";
import { ChainLoader } from "./Setup/ChainLoader";

export const history = createBrowserHistory({ window });

export function App(): JSX.Element {
  useExtensionEvents();
  useOnNamadaExtensionAttached();
  useTransactionNotifications();
  useTransactionCallback();

  return (
    <>
      <Toasts />
      <AppContainer
        data-testid="AppContainer"
        navigation={<Navigation />}
        header={<TopNavigation />}
      >
        <ChainLoader>
          <Outlet />
        </ChainLoader>
      </AppContainer>
    </>
  );
}
