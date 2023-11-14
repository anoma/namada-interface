import { Container } from "@namada/components";
import { getTheme } from "@namada/utils";
import { useVaultContext } from "context/VaultContext";
import { matchPath, useLocation } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AppContent } from "./AppContent";
import { AppHeader } from "./Common/AppHeader";
import { Login } from "./Login";
import routes from "./routes";

export const App: React.FC = () => {
  const theme = getTheme("dark");
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
    <ThemeProvider theme={theme}>
      <Container
        size="popup"
        header={
          <AppHeader
            settingsButton={!isLocked}
            returnButton={displayReturnButton()}
          />
        }
      >
        {shouldLock ? <Login onLogin={unlock} /> : <AppContent />}
      </Container>
    </ThemeProvider>
  );
};
