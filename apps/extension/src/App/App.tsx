import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route, useNavigate } from "react-router-dom";

import { getTheme } from "@anoma/utils";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import {
  CheckIsLockedMsg,
  DerivedAccount,
  KeyStoreType,
  QueryAccountsMsg,
} from "background/keyring";

import {
  AppContainer,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  TopSection,
} from "./App.components";
import { LockWrapper } from "./LockWrapper";
import { Accounts, AddAccount } from "./Accounts";
import { Login } from "./Login";
import { Setup } from "./Setup";
import { TopLevelRoute } from "./types";
import { Loading } from "./Loading";

const requester = new ExtensionRequester();

export enum Status {
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

  const checkIsLocked = async (): Promise<void> => {
    const isLocked = await requester.sendMessage(
      Ports.Background,
      new CheckIsLockedMsg()
    );
    if (isLocked) {
      navigate(TopLevelRoute.Login);
    } else {
      navigate(TopLevelRoute.Accounts);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (status === Status.Completed) {
      if (accounts.length === 0) {
        navigate(TopLevelRoute.Setup);
      } else {
        checkIsLocked();
      }
    }
  }, [status, accounts]);

  const parent = accounts.find(
    (account) => account.type === KeyStoreType.Mnemonic
  );
  const { account: parentAccount = 0 } = parent?.path || {};

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <ContentContainer>
          <TopSection>
            <h1>Anoma Browser Extension</h1>
          </TopSection>
          <Routes>
            <Route path="*" element={<Loading error={error} />} />
            <Route
              path={TopLevelRoute.Accounts}
              element={
                <LockWrapper requester={requester} setStatus={setStatus}>
                  <Accounts accounts={accounts} />
                </LockWrapper>
              }
            />
            <Route path={TopLevelRoute.Setup} element={<Setup />} />
            <Route
              path={TopLevelRoute.Login}
              element={<Login requester={requester} />}
            />
            <Route
              path={TopLevelRoute.AddAccount}
              element={
                <LockWrapper requester={requester} setStatus={setStatus}>
                  <AddAccount
                    parentAccount={parentAccount}
                    accounts={accounts}
                    requester={requester}
                    setAccounts={setAccounts}
                  />
                </LockWrapper>
              }
            />
          </Routes>
        </ContentContainer>
        <BottomSection></BottomSection>
      </AppContainer>
    </ThemeProvider>
  );
};
