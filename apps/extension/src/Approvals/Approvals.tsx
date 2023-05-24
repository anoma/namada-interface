import React from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route } from "react-router-dom";

import { getTheme } from "@anoma/utils";
// import { ExtensionKVStore } from "@anoma/storage";
//
// import { ExtensionMessenger, ExtensionRequester } from "extension";
// import { KVPrefix Ports } from "router";
import {
  AppContainer,
  ContentContainer,
  GlobalStyles,
  TopSection,
  Heading,
} from "./Approvals.components";
import { ApproveTx } from "./ApproveTx/ApproveTx";
import { ApproveConnection } from "./ApproveConnection";
import { TopLevelRoute } from "Approvals/types";

// const store = new ExtensionKVStore(KVPrefix.LocalStorage, {
//   get: browser.storage.local.get,
//   set: browser.storage.local.set,
// });
// const messenger = new ExtensionMessenger();
// // const requester = new ExtensionRequester(messenger, store);
//
export enum Status {
  Completed,
  Pending,
  Failed,
}

export const Approvals: React.FC = () => {
  const theme = getTheme("dark");
  // const [status, setStatus] = useState<Status>();
  // const [error, setError] = useState("");

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <ContentContainer>
          <TopSection>
            <Heading>Anoma Browser Extension</Heading>
          </TopSection>
          <Routes>
            <Route path={TopLevelRoute.ApproveTx} element={<ApproveTx />} />
            <Route
              path={TopLevelRoute.ApproveConnection}
              element={<ApproveConnection />}
            />
          </Routes>
        </ContentContainer>
      </AppContainer>
    </ThemeProvider>
  );
};
