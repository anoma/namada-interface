import { Container } from "@namada/components";
import { useVaultContext } from "context/VaultContext";
import { useRequester } from "hooks/useRequester";
import { CheckDurabilityMsg } from "provider";
import { useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { Ports } from "router";
import { AppContent } from "./AppContent";
import { AppHeader } from "./Common/AppHeader";
import { Login } from "./Login";
import routes from "./routes";

const STORE_DURABILITY_INFO =
  'Store is not durable. This might cause problems when persisting data on disk.\
 To fix this issue, please navigate to "about:config" and set "dom.indexedDB.experimental" to true.';

export const App: React.FC = () => {
  const location = useLocation();

  const [warnings, setWarnings] = useState<string[]>([]);
  const requester = useRequester();

  useEffect(() => {
    void (async () => {
      const isDurable = await requester.sendMessage(
        Ports.Background,
        new CheckDurabilityMsg()
      );
      if (!isDurable) {
        setWarnings([...warnings, STORE_DURABILITY_INFO]);
      }
    })();
  }, []);

  const { lockStatus, unlock, passwordInitialized } = useVaultContext();

  const displayReturnButton = (): boolean => {
    const setupRoute = routes.setup();
    const indexRoute = routes.viewAccountList();
    return Boolean(
      lockStatus === "unlocked" &&
        !matchPath(setupRoute, location.pathname) &&
        !matchPath(indexRoute, location.pathname)
    );
  };

  if (passwordInitialized === undefined || lockStatus === "pending") {
    return null;
  }

  const shouldLock = passwordInitialized && lockStatus === "locked";

  return (
    <Container
      size="popup"
      header={
        <AppHeader
          settingsButton={lockStatus === "unlocked" && passwordInitialized}
          lockButton={
            lockStatus === "unlocked" &&
            passwordInitialized &&
            !displayReturnButton()
          }
          returnButton={displayReturnButton()}
          warnings={warnings}
        />
      }
    >
      {shouldLock ?
        <Login onLogin={unlock} />
      : <AppContent warnings={warnings} />}
    </Container>
  );
};
