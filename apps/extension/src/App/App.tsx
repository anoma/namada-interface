import { Alert, Container } from "@namada/components";
import { getTheme } from "@namada/utils";
import { AccountContext } from "context";
import { useVaultContext } from "context/VaultContext";
import { useContext } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AppContent } from "./AppContent";
import { AppHeader } from "./Common/AppHeader";
import { Login } from "./Login";
import { LoadingStatus } from "./types";
import routes from "./routes";

export const App: React.FC = () => {
  const theme = getTheme("dark");
  const location = useLocation();

  const { isLocked, unlock } = useVaultContext();
  const {
    accounts,
    status: accountLoadingStatus,
    error,
  } = useContext(AccountContext);

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

  const accountLoadingComplete =
    accountLoadingStatus === LoadingStatus.Completed;

  const userHasAccounts = accountLoadingComplete && accounts.length > 0;

  const shouldDisplayAppContent =
    (accountLoadingComplete && !userHasAccounts) || isLocked === false;

  return (
    <ThemeProvider theme={theme}>
      <Container
        size="popup"
        header={<AppHeader returnButton={displayReturnButton()} />}
      >
        {error && (
          <Alert title="Error" type="error">
            {error}
          </Alert>
        )}
        {isLocked && userHasAccounts && <Login onLogin={unlock} />}
        {shouldDisplayAppContent && <AppContent />}
      </Container>
    </ThemeProvider>
  );
};
