import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route, useNavigate } from "react-router-dom";

import { getTheme } from "@anoma/utils";
import { Icon, IconName } from "@anoma/components";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import {
  CheckIsLockedMsg,
  DerivedAccount,
  LockKeyRingMsg,
  QueryAccountsMsg,
} from "background/keyring";
import {
  AppContainer,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  LockExtensionButton,
  TopSection,
} from "./App.components";
import { Accounts, AddAccount } from "./Accounts";
import { Login } from "./Login";
import { Setup } from "./Setup";
import { TopLevelRoute } from "./types";
import { Loading } from "./Loading";

const requester = new ExtensionRequester();

enum Status {
  Completed,
  Pending,
  Failed,
}

export const App: React.FC = () => {
  const theme = getTheme(true, false);
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>();
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus(Status.Pending);
    (async () => {
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
    })();
  }, []);

  useEffect(() => {
    if (status === Status.Completed) {
      if (accounts.length === 0) {
        navigate(TopLevelRoute.Setup);
      } else {
        (async () => {
          const isLocked = await requester.sendMessage(
            Ports.Background,
            new CheckIsLockedMsg()
          );
          if (isLocked) {
            navigate(TopLevelRoute.Login);
          } else {
            navigate(TopLevelRoute.Accounts);
          }
        })();
      }
    }
  }, [status, accounts]);

  const handleLock = async () => {
    try {
      await requester.sendMessage(Ports.Background, new LockKeyRingMsg());
      setAccounts([]);
      setStatus(undefined);
    } catch (e) {
      console.error(e);
    } finally {
      navigate(TopLevelRoute.Login);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <ContentContainer>
          <TopSection>
            <h1>Anoma Browser Extension</h1>
            <LockExtensionButton onClick={handleLock}>
              <Icon iconName={IconName.Lock} />
            </LockExtensionButton>
          </TopSection>
          <Routes>
            <Route path="*" element={<Loading error={error} />} />
            <Route
              path={TopLevelRoute.Accounts}
              element={<Accounts accounts={accounts} />}
            />
            <Route path={TopLevelRoute.Setup} element={<Setup />} />
            <Route
              path={TopLevelRoute.Login}
              element={<Login requester={requester} />}
            />
            <Route
              path={TopLevelRoute.AddAccount}
              element={
                <AddAccount
                  accounts={accounts}
                  requester={requester}
                  setAccounts={setAccounts}
                />
              }
            />
          </Routes>
        </ContentContainer>
        <BottomSection></BottomSection>
      </AppContainer>
    </ThemeProvider>
  );
};
