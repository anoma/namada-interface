import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { Routes, Route } from "react-router-dom";

import { getTheme } from "@namada/utils";
import { TxType } from "@namada/shared";

import {
  AppContainer,
  ContentContainer,
  GlobalStyles,
  TopSection,
  Heading,
} from "./Approvals.components";
import { ApproveConnection } from "./ApproveConnection";
import { TopLevelRoute } from "Approvals/types";
import { ConfirmLedgerTx } from "./ApproveTx/ConfirmLedgerTx";
import { ConfirmTx } from "./ApproveTx/ConfirmTx";
import { ApproveTx } from "./ApproveTx/ApproveTx";

export enum Status {
  Completed,
  Pending,
  Failed,
}

export type ApprovalDetails = {
  source: string | null;
  msgId: string | null;
  txType: TxType | null;
  publicKey: string | null;
  target: string | null;
};

export const Approvals: React.FC = () => {
  const theme = getTheme("dark");
  const [details, setDetails] = useState<ApprovalDetails>();

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
              path={`${TopLevelRoute.ApproveTx}/:type`}
              element={<ApproveTx setDetails={setDetails} />}
            />
            <Route
              path={TopLevelRoute.ConfirmTx}
              element={<ConfirmTx details={details} />}
            />
            <Route
              path={TopLevelRoute.ConfirmLedgerTx}
              element={<ConfirmLedgerTx details={details} />}
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
