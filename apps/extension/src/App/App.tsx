import { Container } from "@namada/components";
import { useVaultContext } from "context/VaultContext";
import { matchPath, useLocation } from "react-router-dom";
import { AppContent } from "./AppContent";
import { AppHeader } from "./Common/AppHeader";
import { Login } from "./Login";
import routes from "./routes";

export const App: React.FC = () => {
  const location = useLocation();

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
        />
      }
    >
      {shouldLock ?
        <Login onLogin={unlock} />
      : <AppContent />}
    </Container>
  );
};
