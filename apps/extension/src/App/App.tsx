import React, { useEffect, useState } from "react";
import {
  Outlet,
  Route,
  Routes,
  matchPath,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { Alert, Container, Loading } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { formatRouterPath, getTheme } from "@namada/utils";
import { GetActiveAccountMsg } from "background/keyring";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import {
  CheckDurabilityMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
  QueryAccountsMsg,
} from "provider/messages";
import { Ports } from "router";
import { AddAccount, DeleteAccount, ViewAccount } from "./Accounts";
import { ParentAccounts } from "./Accounts/ParentAccounts";
import { ContentContainer } from "./App.components";
import { AppHeader } from "./Common/AppHeader";
import { ConnectedSites } from "./ConnectedSites";
import { LockWrapper } from "./LockWrapper";
import { Setup } from "./Setup";
import { AccountManagementRoute, TopLevelRoute } from "./types";
import { LockKey } from "./Common/LockKey";

export enum Status {
  Completed = "Completed",
  Pending = "Pending",
  Failed = "Failed",
}

const STORE_DURABILITY_INFO =
  'Store is not durable. This might cause problems when persisting data on disk.\
 To fix this issue, please navigate to "about:config" and set "dom.indexedDB.experimental" to true.';

export const App: React.FC = () => {
  const theme = getTheme("dark");
  const query = useQuery();
  const redirect = query.get("redirect");
  const navigate = useNavigate();
  const location = useLocation();
  const requester = useRequester();

  const [isLocked, setIsLocked] = useState(true);
  const [isDurable, setIsDurable] = useState<boolean | undefined>();
  const [status, setStatus] = useState<Status>();
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [parentAccount, setParentAccount] = useState<DerivedAccount>();
  const [error, setError] = useState("");
  const [loadingStatus, setLoadingStatus] = useState("");
  const [maspStatus, setMaspStatus] = useState<{
    status: Status;
    info: string;
  }>({ status: Status.Completed, info: "" });

  const fetchAccounts = async (): Promise<void> => {
    setLoadingStatus("Loading accounts...");
    setStatus(Status.Pending);
    try {
      const accounts = await requester.sendMessage(
        Ports.Background,
        new QueryAccountsMsg()
      );
      setAccounts(accounts);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while loading extension: ${e}`);
      setStatus(Status.Failed);
    } finally {
      setStatus(Status.Completed);
      setLoadingStatus("");
    }
  };

  const fetchParentAccountId = async (): Promise<void> => {
    setLoadingStatus("Loading parent...");
    setStatus(Status.Pending);
    try {
      const parent = await requester.sendMessage(
        Ports.Background,
        new GetActiveAccountMsg()
      );
      const parentAccount = accounts.find(
        (account) => account.id === parent?.id
      );
      setParentAccount(parentAccount);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while loading extension: ${e}`);
      setStatus(Status.Failed);
    } finally {
      setStatus(Status.Completed);
      setLoadingStatus("");
    }
  };

  // Fetch Masp params if they don't exist
  const fetchMaspParams = async (): Promise<void> => {
    const hasMaspParams = await requester.sendMessage(
      Ports.Background,
      new HasMaspParamsMsg()
    );

    if (!hasMaspParams) {
      setMaspStatus({
        status: Status.Pending,
        info: "Fetching MASP parameters...",
      });
      try {
        await requester.sendMessage(
          Ports.Background,
          new FetchAndStoreMaspParamsMsg()
        );
        setMaspStatus({
          status: Status.Completed,
          info: "",
        });
      } catch (e) {
        setMaspStatus({
          status: Status.Failed,
          info: `Fetching MASP parameters failed: ${e}`,
        });
        //TODO: Notify user in a better way
        console.error(e);
      }
    }
  };

  const getStartPage = (): string => {
    if (!parentAccount) {
      return formatRouterPath([TopLevelRoute.Setup]);
    } else {
      return formatRouterPath([
        TopLevelRoute.Accounts,
        AccountManagementRoute.ViewAccounts,
      ]);
    }
  };

  const goToStartPage = (): void => navigate(getStartPage());

  const isStartPage = (): boolean => {
    const startPage = getStartPage();
    return !!matchPath({ path: startPage }, location.pathname);
  };

  const onDeleteKey = async (): Promise<void> => {
    await fetchAccounts();
    goToStartPage();
  };

  useEffect(() => {
    if (status === Status.Completed) {
      fetchMaspParams();
    }
  }, [status]);

  // Provide a redirect in the case of transaction/connection approvals
  useEffect(() => {
    if (redirect) {
      navigate(redirect);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchParentAccountId();
    }
  }, [accounts]);

  useEffect(() => {
    if (status === Status.Completed) {
      goToStartPage();
    }
  }, [status, parentAccount]);

  useEffect(() => {
    (async () => {
      const isDurable = await requester.sendMessage(
        Ports.Background,
        new CheckDurabilityMsg()
      );
      setIsDurable(isDurable);
    })();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container
        size="popup"
        header={<AppHeader returnButton={!isStartPage()} />}
      >
        <Loading status={loadingStatus} visible={!!loadingStatus} />
        <ContentContainer>
          {isDurable === false && (
            <Alert type="warning">{STORE_DURABILITY_INFO}</Alert>
          )}

          {maspStatus.status === Status.Completed && maspStatus.info && (
            <Alert title="MASP Status" type="warning">
              {maspStatus.info}
            </Alert>
          )}

          {error && (
            <Alert title="Error" type="error">
              {error}
            </Alert>
          )}

          <Routes>
            <Route path={TopLevelRoute.Setup} element={<Setup />} />
            <Route
              path={TopLevelRoute.ConnectedSites}
              element={<ConnectedSites />}
            />

            {/* Routes that depend on a parent account existing in storage */}
            {parentAccount && (
              <>
                <Route path={TopLevelRoute.Accounts} element={<Outlet />}>
                  <Route
                    path={AccountManagementRoute.ViewAccounts}
                    element={
                      <ParentAccounts
                        onSelectAccount={fetchAccounts}
                        activeAccountId={parentAccount.id}
                      />
                    }
                  />
                  <Route
                    path={AccountManagementRoute.DeleteAccount}
                    element={<DeleteAccount onComplete={onDeleteKey} />}
                  />
                  <Route
                    path={AccountManagementRoute.ViewAccount}
                    element={<ViewAccount />}
                  />
                  <Route
                    path={AccountManagementRoute.AddAccount}
                    element={
                      <LockWrapper
                        requester={requester}
                        setStatus={setStatus}
                        isLocked={isLocked}
                        lockKeyRing={() => setIsLocked(true)}
                      >
                        <AddAccount
                          accounts={accounts}
                          parentAccount={parentAccount}
                          requester={requester}
                          setAccounts={setAccounts}
                          isLocked={isLocked}
                          unlockKeyRing={() => setIsLocked(false)}
                        />
                      </LockWrapper>
                    }
                  />
                </Route>
              </>
            )}
          </Routes>
        </ContentContainer>
      </Container>
    </ThemeProvider>
  );
};
