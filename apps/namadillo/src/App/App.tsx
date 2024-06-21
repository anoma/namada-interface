import { Container } from "App/Common/Container";
import { Toasts } from "App/Common/Toast";
import { TopNavigation } from "App/Common/TopNavigation";
import { createBrowserHistory } from "history";
import { useExtensionEvents } from "hooks/useExtensionEvents";
import { useSmallScreen } from "hooks/useIsSmallScren";
import { useOnNamadaExtensionAttached } from "hooks/useOnNamadaExtensionAttached";
import { useTransactionCallback } from "hooks/useTransactionCallbacks";
import { useTransactionNotifications } from "hooks/useTransactionNotifications";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Common/Navigation";
import { SmallScreenBlocking } from "./Common/SmallScreenBlocking";

export const history = createBrowserHistory({ window });

export function App(): JSX.Element {
  useExtensionEvents();
  useOnNamadaExtensionAttached();
  useTransactionNotifications();
  useTransactionCallback();

  const isSmallScreen = useSmallScreen();

  // Namadillo should work in desktop resolutions only
  if (isSmallScreen === undefined) return <></>;
  if (isSmallScreen) {
    return <SmallScreenBlocking />;
  }

  return (
    <>
      <Toasts />
      <Container
        data-testid="AppContainer"
        navigation={<Navigation />}
        header={<TopNavigation />}
      >
        <Outlet />
      </Container>
    </>
  );
}
