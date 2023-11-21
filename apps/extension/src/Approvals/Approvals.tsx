import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import { Container } from "@namada/components";
import { TxType } from "@namada/shared";

import { ApproveConnection } from "./ApproveConnection";
import { TopLevelRoute } from "Approvals/types";
import { ConfirmLedgerTx } from "./ApproveTx/ConfirmLedgerTx";
import { ConfirmTx } from "./ApproveTx/ConfirmTx";
import { ApproveTx } from "./ApproveTx/ApproveTx";
import { AppHeader } from "App/Common/AppHeader";

export enum Status {
  Completed,
  Pending,
  Failed,
}

export type ApprovalDetails = {
  source: string;
  msgId: string;
  txType: TxType;
  publicKey?: string;
  target?: string;
};

export const Approvals: React.FC = () => {
  const [details, setDetails] = useState<ApprovalDetails>();

  return (
    <Container
      size="popup"
      header={<AppHeader returnButton={false} settingsButton={false} />}
    >
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
    </Container>
  );
};
