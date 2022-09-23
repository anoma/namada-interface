import React, { useEffect, useState } from "react";
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
  GlobalStyles,
  TopSection,
} from "./App.components";
import Accounts from "./Accounts/Accounts";

const requester = new ExtensionRequester();

export const App: React.FC = () => {
  const theme = getTheme(true, false);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const accounts = await requester.sendMessage(
          Ports.Background,
          new QueryAccountsMsg()
        );
        if (accounts.length > 0) {
          setAccounts(accounts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <TopSection>
          <h1>Anoma Browser Extension</h1>
        </TopSection>
        <ContentContainer>
          {!isLoading && accounts.length === 0 && (
            <Button
              variant={ButtonVariant.Contained}
              onClick={() => {
                browser.tabs.create({
                  url: browser.runtime.getURL("setup.html"),
                });
              }}
            >
              Launch Initial Set-Up
            </Button>
          )}
          <Accounts accounts={accounts} />
        </ContentContainer>
        <BottomSection></BottomSection>
      </AppContainer>
    </ThemeProvider>
  );
};
