import browser from "webextension-polyfill";
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route } from "react-router-dom";

import { ExtensionKVStore } from "@anoma/storage";
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
import { ApproveTx, ConfirmTx } from "./ApproveTx";
import { ApproveConnection } from "./ApproveConnection";
import { TopLevelRoute } from "Approvals/types";
import { ExtensionMessenger, ExtensionRequester } from "extension";
import { KVPrefix } from "router";

const store = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const messenger = new ExtensionMessenger();
const requester = new ExtensionRequester(messenger, store);
//
export enum Status {
  Completed,
  Pending,
  Failed,
}

export const Approvals: React.FC = () => {
  const theme = getTheme("dark");
  const [txId, setTxId] = useState("");
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
            <Route
              path={TopLevelRoute.ApproveTx}
              element={<ApproveTx setTxId={setTxId} requester={requester} />}
            />
            <Route
              path={TopLevelRoute.ConfirmTx}
              element={<ConfirmTx txId={txId} requester={requester} />}
            />
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
