import { Toasts } from "App/Common/Toast";
import { AppLayout } from "App/Layout/AppLayout";
import { createBrowserHistory } from "history";
import { useExtensionEvents } from "hooks/useExtensionEvents";
import { useRegistryFeatures } from "hooks/useRegistryFeatures";
import { useServerSideEvents } from "hooks/useServerSideEvents";
import { useTransactionCallback } from "hooks/useTransactionCallbacks";
import { useTransactionNotifications } from "hooks/useTransactionNotifications";
import { useTransactionWatcher } from "hooks/useTransactionWatcher";
import { Outlet } from "react-router-dom";
import { ChainLoader } from "./Setup/ChainLoader";

export const history = createBrowserHistory({ window });

export function App(): JSX.Element {
  useExtensionEvents();
  useTransactionNotifications();
  useTransactionCallback();
  useTransactionWatcher();
  useRegistryFeatures();
  useServerSideEvents();

  return (
    <>
      <Toasts />
      <AppLayout>
        <ChainLoader>
          <Outlet />
        </ChainLoader>
      </AppLayout>
    </>
  );
}
