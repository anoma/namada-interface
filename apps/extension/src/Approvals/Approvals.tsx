import browser from "webextension-polyfill";
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route } from "react-router-dom";

import { ExtensionKVStore } from "@anoma/storage";
import { getTheme } from "@anoma/utils";

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
import { useRequester } from "App/Requester";

export enum Status {
  Completed,
  Pending,
  Failed,
}

export const Approvals: React.FC = () => {
  const requester = useRequester();
  const theme = getTheme("dark");
  const [txId, setTxId] = useState("");
  const [address, setAddress] = useState("");

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
              element={
                <ApproveTx
                  setTxId={setTxId}
                  setAddress={setAddress}
                  requester={requester}
                />
              }
            />
            <Route
              path={TopLevelRoute.ConfirmTx}
              element={
                <ConfirmTx
                  txId={txId}
                  address={address}
                  requester={requester}
                />
              }
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
