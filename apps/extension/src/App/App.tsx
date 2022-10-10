import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import browser from "webextension-polyfill";

import { Button, ButtonVariant } from "@anoma/components";
import { getTheme } from "@anoma/utils";

import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { DerivedAccount, QueryAccountsMsg } from "background/keyring";
import {
  AppContainer,
  BottomSection,
  ContentContainer,
  LoadingError,
  GlobalStyles,
  TopSection,
} from "./App.components";
import Accounts from "./Accounts/Accounts";
import AddAccount from "./Accounts/AddAccount";
import { TopLevelRoute } from "App/types";

const requester = new ExtensionRequester();

enum Status {
  Completed,
  Pending,
  Failed,
}

export const App: React.FC = () => {
  const theme = getTheme(true, false);
  const [status, setStatus] = useState<Status>();
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);

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
        setStatus(Status.Failed);
      } finally {
        setStatus(Status.Completed);
      }
    })();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <ContentContainer>
          <TopSection>
            <h1>Anoma Browser Extension</h1>
          </TopSection>

          {status === Status.Completed && accounts.length === 0 && (
            <Button
              variant={ButtonVariant.ContainedAlternative}
              onClick={() => {
                browser.tabs.create({
                  url: browser.runtime.getURL("setup.html"),
                });
              }}
            >
              Launch Initial Set-Up
            </Button>
          )}
          {status === Status.Completed && accounts.length > 0 && (
            <BrowserRouter>
              <Routes>
                <Route path={`*`} element={<Accounts accounts={accounts} />} />
                <Route
                  path={TopLevelRoute.WalletAddAccount}
                  element={
                    <AddAccount
                      accounts={accounts}
                      requester={requester}
                      setAccounts={setAccounts}
                    />
                  }
                />
              </Routes>
            </BrowserRouter>
          )}
          {status === Status.Failed && (
            <LoadingError>An error occured loading accounts!</LoadingError>
          )}
        </ContentContainer>
        <BottomSection></BottomSection>
      </AppContainer>
    </ThemeProvider>
  );
};
