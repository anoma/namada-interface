import browser from "webextension-polyfill";
import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { getTheme } from "@anoma/utils";
import { ExtensionMessenger, ExtensionRequester } from "extension";

import { AccountCreation } from "./AccountCreation";
import {
  AppContainer,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  TopSection,
} from "./Setup.components";
import { ExtensionKVStore } from "@anoma/storage";
import { KVPrefix } from "router";

const store = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const messenger = new ExtensionMessenger();
const requester = new ExtensionRequester(messenger, store);

export const Setup: React.FC = () => {
  const theme = getTheme("dark");

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <TopSection>Anoma Browser Extension</TopSection>
        <ContentContainer>
          <HashRouter>
            <Routes>
              <Route
                path={`*`}
                element={<AccountCreation requester={requester} />}
              />
            </Routes>
          </HashRouter>
        </ContentContainer>
        <BottomSection></BottomSection>
      </AppContainer>
    </ThemeProvider>
  );
};
