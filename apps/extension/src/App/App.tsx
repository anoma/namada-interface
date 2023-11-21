import { Container } from "@namada/components";
import { useVaultContext } from "context/VaultContext";
import { matchPath, useLocation } from "react-router-dom";
import { AppContent } from "./AppContent";
import { AppHeader } from "./Common/AppHeader";
import { Login } from "./Login";
import routes from "./routes";

export const App: React.FC = () => {
  const location = useLocation();

  const { isLocked, unlock, passwordInitialized } = useVaultContext();

  const displayReturnButton = (): boolean => {
    const setupRoute = routes.setup();
    const indexRoute = routes.viewAccountList();
    return Boolean(
      !isLocked &&
        isLocked !== undefined &&
        !matchPath(setupRoute, location.pathname) &&
        !matchPath(indexRoute, location.pathname)
    );
  };

  const shouldLock = passwordInitialized && isLocked;
  if (passwordInitialized === undefined) return null;

  return (
    <Container
      size="popup"
      header={
        <AppHeader
          settingsButton={!isLocked && passwordInitialized}
          lockButton={
            !isLocked && passwordInitialized && !displayReturnButton()
          }
          returnButton={displayReturnButton()}
        />
      }
    >
      {shouldLock ? <Login onLogin={unlock} /> : <AppContent />}
    </Container>
  );
};
