import { Container } from "@namada/components";
import { formatRouterPath, getTheme } from "@namada/utils";
import { useSystemLock } from "hooks/useSystemLock";
import { matchPath, useLocation } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AppContent } from "./AppContent";
import { AppHeader } from "./Common/AppHeader";
import { Login } from "./Login";
import { AccountManagementRoute, TopLevelRoute } from "./types";

export const App: React.FC = () => {
  const theme = getTheme("dark");
  const location = useLocation();
  const { isLocked, unlock, lock } = useSystemLock();

  const displayReturnButton = (): boolean => {
    const setupRoute = formatRouterPath([TopLevelRoute.Setup]);
    const indexRoute = formatRouterPath([
      TopLevelRoute.Accounts,
      AccountManagementRoute.ViewAccounts,
    ]);

    return Boolean(
      !isLocked &&
        isLocked !== undefined &&
        !matchPath(setupRoute, location.pathname) &&
        !matchPath(indexRoute, location.pathname)
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        size="popup"
        header={<AppHeader returnButton={displayReturnButton()} />}
      >
        {isLocked && <Login onLogin={unlock} />}
        {isLocked === false && <AppContent onLockApp={lock} />}
      </Container>
    </ThemeProvider>
  );
};
