import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route, useNavigate } from "react-router-dom";

import { DerivedAccount } from "@anoma/types";
import { getTheme } from "@anoma/utils";
import { Icon, IconName } from "@anoma/components";
import { useUntil } from "@anoma/hooks";

import { Ports } from "router";
import {
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
  QueryAccountsMsg,
} from "provider/messages";
import { GetActiveAccountMsg } from "background/keyring";
import { useQuery } from "hooks";
import {
  AppContainer,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  TopSection,
  Heading,
  HeadingButtons,
  SettingsButton,
  HeadingLoader,
} from "./App.components";
import { TopLevelRoute } from "./types";
import { LockWrapper } from "./LockWrapper";
import { Accounts, AddAccount } from "./Accounts";
import { Loading } from "./Loading";
import { Login } from "./Login";
import { Setup } from "./Setup";
import { Settings } from "./Settings";
import { useRequester } from "hooks/useRequester";

export enum Status {
  Completed = "Completed",
  Pending = "Pending",
  Failed = "Failed",
}

export const App: React.FC = () => {
  const theme = getTheme("dark");
  const query = useQuery();
  const redirect = query.get("redirect");
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(true);
  const [status, setStatus] = useState<Status>();
  const [maspStatus, setMaspStatus] = useState<{
    status: Status;
    info: string;
  }>({ status: Status.Completed, info: "" });
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [parentAccount, setParentAccount] = useState<DerivedAccount>();
  const [error, setError] = useState("");
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
      const parentId = await requester.sendMessage(
        Ports.Background,
        new GetActiveAccountMsg()
      );
      const parentAccount = accounts.find((account) => account.id === parentId);
      setParentAccount(parentAccount);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while loading extension: ${e}`);
      setStatus(Status.Failed);
    } finally {
      setStatus(Status.Completed);
    }
  };

  useUntil(
    {
      predFn: async () => {
        setStatus(Status.Pending);
        try {
          const accounts = await requester.sendMessage(
            Ports.Background,
            new QueryAccountsMsg()
          );

          setAccounts(accounts);
          return true;
        } catch (e) {
          console.warn(e);
          return false;
        }
      },
      onSuccess: () => {
        setStatus(Status.Completed);
      },
      onFail: () => {
        setError("An error occurred connecting to extension");
        setStatus(Status.Failed);
      },
    },
    { tries: 10, ms: 100 },
    []
  );

  // Fetch Masp params if they don't exist
  useEffect(() => {
    if (status === Status.Completed) {
      (async () => {
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
      })();
    }
  }, [status]);

  useEffect(() => {
    if (redirect) {
      // Provide a redirect in the case of transaction/connection approvals
      navigate(redirect);
    }
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchParentAccountId();
    }
  }, [accounts]);

  useEffect(() => {
    if (status === Status.Completed) {
      if (!parentAccount) {
        navigate(TopLevelRoute.Setup);
      } else {
        navigate(TopLevelRoute.Accounts);
      }
    }
  }, [status, parentAccount]);

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <ContentContainer>
          <TopSection>
            <Heading>Anoma Browser Extension</Heading>
            <HeadingLoader
              className={
                maspStatus.status === Status.Pending ? "is-loading" : ""
              }
              title={maspStatus.info}
            />
            <HeadingButtons>
              {parentAccount && (
                <SettingsButton
                  onClick={() => navigate(TopLevelRoute.Settings)}
                >
                  <Icon iconName={IconName.Settings} />
                </SettingsButton>
              )}
            </HeadingButtons>
          </TopSection>
          <Routes>
            <Route
              path="*"
              element={<Loading status={status} error={error} />}
            />
            <Route path={TopLevelRoute.Setup} element={<Setup />} />
            <Route
              path={TopLevelRoute.Login}
              element={<Login requester={requester} />}
            />
            {/* Routes that depend on a parent account existing in storage */}
            {parentAccount && (
              <>
                <Route
                  path={TopLevelRoute.Accounts}
                  element={
                    <Accounts accounts={accounts} requester={requester} />
                  }
                />
                <Route
                  path={TopLevelRoute.AddAccount}
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
                <Route
                  path={TopLevelRoute.Settings}
                  element={
                    <Settings
                      requester={requester}
                      onSelectAccount={fetchAccounts}
                      activeAccountId={parentAccount.id}
                    />
                  }
                />
              </>
            )}
          </Routes>
        </ContentContainer>
        <BottomSection></BottomSection>
      </AppContainer>
    </ThemeProvider>
  );
};
