import browser from "webextension-polyfill";
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route, useNavigate } from "react-router-dom";

import { AccountType, DerivedAccount } from "@anoma/types";
import { getTheme } from "@anoma/utils";
import { ExtensionMessenger, ExtensionRequester } from "extension";
import { KVPrefix, Ports } from "router";
import { CheckIsLockedMsg } from "background/keyring";
import { QueryAccountsMsg } from "provider/messages";
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
import { ExtensionKVStore } from "@anoma/storage";

const store = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const messenger = new ExtensionMessenger();
const requester = new ExtensionRequester(messenger, store);

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

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (status === Status.Completed) {
      if (accounts.length === 0) {
        navigate(TopLevelRoute.Setup);
      } else {
        navigate(TopLevelRoute.Accounts);
      }
    }
  }, [status, accounts]);

  const parent = accounts.find(
    (account) => account.type === AccountType.Mnemonic
  );
  const parentAccount = parent?.path?.account ?? 0;

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
                  <Accounts accounts={accounts} requester={requester} />
                </LockWrapper>
              }
            />
            <Route path={TopLevelRoute.Setup} element={<Setup />} />
            <Route
              path={TopLevelRoute.Login}
              element={
                <Login requester={requester} route={TopLevelRoute.AddAccount} />
              }
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
