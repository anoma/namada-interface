import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

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
import { Accounts } from "./Accounts";
import { Setup } from "./Setup";
import { TopLevelRoute } from "./types";
import { Loading } from "./Loading";

const requester = new ExtensionRequester();

export const App: React.FC = () => {
  const theme = getTheme(true, false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const accounts = await requester.sendMessage(
          Ports.Background,
          new QueryAccountsMsg()
        );
        setAccounts(accounts);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // TODO: Check for authenticated extension
    if (!isLoading) {
      if (accounts.length === 0) {
        navigate(TopLevelRoute.Setup);
      } else {
        navigate(TopLevelRoute.Accounts);
      }
    }
  }, [isLoading, accounts]);

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <ContentContainer>
          <TopSection>
            <h1>Anoma Browser Extension</h1>
          </TopSection>
          <Routes>
            <Route path="*" element={<Loading />} />
            <Route
              path={TopLevelRoute.Accounts}
              element={<Accounts accounts={accounts} />}
            />
            <Route path={TopLevelRoute.Setup} element={<Setup />} />
          </Routes>
        </ContentContainer>
        <BottomSection></BottomSection>
      </AppContainer>
    </ThemeProvider>
  );
};
