import React, { useEffect, useState } from "react";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { Container, Image, ImageName } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { formatRouterPath, getTheme } from "@namada/utils";

import { Loading } from "@namada/components";
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
import { Accounts, AddAccount } from "./Accounts";
import { DeleteAccount } from "./Accounts/DeleteAccount";
import ParentAccounts from "./Accounts/ParentAccounts";
import { ContentContainer, LogoContainer } from "./App.components";
import { ConnectedSites } from "./ConnectedSites";
import { LockWrapper } from "./LockWrapper";
import { Login } from "./Login";
import { Setup } from "./Setup";
import { AccountManagementRoute, TopLevelRoute } from "./types";

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
  const [isLocked, setIsLocked] = useState(true);
  const [isDurable, setIsDurable] = useState<boolean>();
  const [status, setStatus] = useState<Status>();
  const [maspStatus, setMaspStatus] = useState<{
    status: Status;
    info: string;
  }>({ status: Status.Completed, info: "" });
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [parentAccount, setParentAccount] = useState<DerivedAccount>();
  const [error, setError] = useState("");
  const [loadingStatus, setLoadingStatus] = useState("");
  const requester = useRequester();

  const fetchAccounts = async (): Promise<void> => {
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
    }
  };

  const fetchParentAccountId = async (): Promise<void> => {
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

  const goToStartPage = (): void => {
    if (!parentAccount) {
      navigate(TopLevelRoute.Setup);
    } else {
      navigate(
        formatRouterPath([
          TopLevelRoute.Accounts,
          AccountManagementRoute.ParentAccounts,
        ])
      );
    }
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

  useEffect(() => {
    if (redirect) {
      // Provide a redirect in the case of transaction/connection approvals
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
        header={
          <LogoContainer>
            <Image imageName={ImageName.Logo} />
          </LogoContainer>
        }
      >
        {/* <HeadingLoader
          className={maspStatus.status === Status.Pending ? "is-loading" : ""}
          title={maspStatus.info}
        />

        <Info
          title={isDurable ? "" : STORE_DURABILITY_INFO}
          className={isDurable === false ? "visible" : ""}
        >
          <Icon iconName={IconName.Info} />
        </Info>
      */}
        <Loading status={loadingStatus} visible={!!loadingStatus} />
        <ContentContainer>
          <Routes>
            <Route path={TopLevelRoute.Setup} element={<Setup />} />
            <Route
              path={TopLevelRoute.Login}
              element={<Login requester={requester} />}
            />
            <Route
              path={TopLevelRoute.ConnectedSites}
              element={<ConnectedSites />}
            />

            {/* Routes that depend on a parent account existing in storage */}
            {parentAccount && (
              <>
                <Route path={TopLevelRoute.Accounts} element={<Outlet />}>
                  <Route
                    path={AccountManagementRoute.ParentAccounts}
                    element={
                      <ParentAccounts
                        requester={requester}
                        onSelectAccount={fetchAccounts}
                        activeAccountId={parentAccount.id}
                      />
                    }
                  />
                  <Route
                    path={AccountManagementRoute.DeleteAccount}
                    element={
                      <DeleteAccount
                        requester={requester}
                        onComplete={onDeleteKey}
                      />
                    }
                  />
                  <Route
                    path={AccountManagementRoute.ViewAccount}
                    element={
                      <Accounts accounts={accounts} requester={requester} />
                    }
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
