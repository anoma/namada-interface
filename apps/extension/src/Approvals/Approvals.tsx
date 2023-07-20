import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route } from "react-router-dom";

import { getTheme } from "@namada/utils";

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
import { ConfirmLedgerTransfer } from "./ApproveTransfer/ConfirmLedgerTransfer";
import { ApproveBond, ConfirmBond, ConfirmLedgerBond } from "./ApproveBond";

export enum Status {
  Completed,
  Pending,
  Failed,
}

export const Approvals: React.FC = () => {
  const theme = getTheme("dark");
  const [msgId, setMsgId] = useState("");
  const [address, setAddress] = useState("");
  const [publicKey, setPublicKey] = useState("");

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <ContentContainer>
          <TopSection>
            <Heading>Namada Browser Extension</Heading>
          </TopSection>
          <Routes>
            <Route
              path={TopLevelRoute.ApproveTransfer}
              element={
                <ApproveTransfer setMsgId={setMsgId} setAddress={setAddress} />
              }
            />
            <Route
              path={TopLevelRoute.ConfirmTransfer}
              element={<ConfirmTransfer msgId={msgId} address={address} />}
            />
            <Route
              path={TopLevelRoute.ConfirmLedgerTransfer}
              element={<ConfirmLedgerTransfer msgId={msgId} />}
            />
            <Route
              path={TopLevelRoute.ApproveBond}
              element={
                <ApproveBond
                  setAddress={setAddress}
                  setMsgId={setMsgId}
                  setPublicKey={setPublicKey}
                />
              }
            />
            <Route
              path={TopLevelRoute.ConfirmBond}
              element={<ConfirmBond msgId={msgId} address={address} />}
            />
            <Route
              path={TopLevelRoute.ConfirmLedgerBond}
              element={
                <ConfirmLedgerBond
                  address={address}
                  msgId={msgId}
                  publicKey={publicKey}
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
