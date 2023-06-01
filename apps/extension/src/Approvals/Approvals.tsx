import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route } from "react-router-dom";

import { getTheme } from "@anoma/utils";

import {
  AppContainer,
  ContentContainer,
  GlobalStyles,
  TopSection,
  Heading,
} from "./Approvals.components";
import { ApproveTransfer, ConfirmTransfer } from "./ApproveTransfer";
import { ApproveConnection } from "./ApproveConnection";
import { TopLevelRoute } from "Approvals/types";

export enum Status {
  Completed,
  Pending,
  Failed,
}

export const Approvals: React.FC = () => {
  const theme = getTheme("dark");
  const [msgId, setMsgId] = useState("");
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
                <ApproveTransfer setMsgId={setMsgId} setAddress={setAddress} />
              }
            />
            <Route
              path={TopLevelRoute.ConfirmTx}
              element={<ConfirmTransfer msgId={msgId} address={address} />}
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
