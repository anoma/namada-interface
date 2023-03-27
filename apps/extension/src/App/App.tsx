import browser from "webextension-polyfill";
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route, useNavigate } from "react-router-dom";

import { AccountType, DerivedAccount } from "@anoma/types";
import { getTheme } from "@anoma/utils";
import { ExtensionKVStore } from "@anoma/storage";

import {
  ExtensionMessenger,
  ExtensionRequester,
  getAnomaRouterId,
} from "extension";
import { KVPrefix, Ports } from "router";
import { QueryAccountsMsg } from "provider/messages";
import { useQuery } from "hooks";
import {
  AppContainer,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  TopSection,
} from "./App.components";
import { TopLevelRoute } from "./types";
import { LockWrapper } from "./LockWrapper";
import { Accounts, AddAccount } from "./Accounts";
import { Login } from "./Login";
import { Setup } from "./Setup";
import { Loading } from "./Loading";
import { ApproveConnection, ApproveTx } from "./Approvals";

const getRouterId = async (): Promise<number | undefined> =>
  getAnomaRouterId(store);
const store = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const messenger = new ExtensionMessenger();
const requester = new ExtensionRequester(messenger, getRouterId);

export enum Status {
  Completed,
  Pending,
  Failed,
}

export const App: React.FC = () => {
  const theme = getTheme("dark");
  const query = useQuery();
  const redirect = query.get("redirect");
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(true);
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
    if (redirect) {
      // Provide a redirect in the case of transaction/connection approvals
      navigate(redirect);
    } else {
      fetchAccounts();
    }
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
              element={<Accounts accounts={accounts} requester={requester} />}
            />
            <Route path={TopLevelRoute.Setup} element={<Setup />} />
            <Route
              path={TopLevelRoute.ApproveConnection}
              element={
                <LockWrapper
                  requester={requester}
                  setStatus={setStatus}
                  isLocked={isLocked}
                  lockKeyRing={() => setIsLocked(true)}
                >
                  <ApproveConnection
                    requester={requester}
                    isLocked={isLocked}
                    unlockKeyRing={() => setIsLocked(false)}
                  />
                </LockWrapper>
              }
            />
            <Route
              path={TopLevelRoute.ApproveTx}
              element={
                <LockWrapper
                  requester={requester}
                  setStatus={setStatus}
                  isLocked={isLocked}
                  lockKeyRing={() => setIsLocked(true)}
                >
                  <ApproveTx
                    requester={requester}
                    isLocked={isLocked}
                    unlockKeyRing={() => setIsLocked(false)}
                  />
                </LockWrapper>
              }
            />
            <Route
              path={TopLevelRoute.Login}
              element={<Login requester={requester} />}
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
                    parentAccount={parentAccount}
                    accounts={accounts}
                    requester={requester}
                    setAccounts={setAccounts}
                    isLocked={isLocked}
                    unlockKeyRing={() => setIsLocked(false)}
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
