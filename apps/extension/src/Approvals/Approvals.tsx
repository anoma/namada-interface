import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { TxType } from "@heliax/namada-sdk/web";
import { Container } from "@namada/components";

import { AppHeader } from "App/Common/AppHeader";
import { TopLevelRoute } from "Approvals/types";
import { ApproveConnection } from "./ApproveConnection";
import { ApproveSignature } from "./ApproveSignature";
import { ApproveTx } from "./ApproveTx/ApproveTx";
import { ConfirmLedgerTx } from "./ApproveTx/ConfirmLedgerTx";
import { ConfirmTx } from "./ApproveTx/ConfirmTx";
import { ConfirmSignature } from "./ConfirmSignature";

export enum Status {
  Completed,
  Pending,
  Failed,
}

// TODO: Handle array of ApprovalDetails
export type ApprovalDetails = {
  source: string;
  msgId: string;
  txType: TxType;
  publicKey?: string;
  target?: string;
  nativeToken?: string;
  tokenAddress?: string;
  amount?: string;
  validator?: string;
};

export type SignatureDetails = {
  msgId: string;
  signer: string;
};

export const Approvals: React.FC = () => {
  const [details, setDetails] = useState<ApprovalDetails>();
  const [signatureDetails, setSignatureDetails] = useState<SignatureDetails>();

  return (
    <Container
      size="popup"
      header={
        <AppHeader
          lockButton={false}
          returnButton={false}
          settingsButton={false}
        />
      }
    >
      <Routes>
        <Route
          path={`${TopLevelRoute.ApproveTx}/:msgId/:type/:accountType`}
          element={<ApproveTx setDetails={setDetails} details={details} />}
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
        <Route
          path={`${TopLevelRoute.ApproveSignature}/:signer`}
          element={
            <ApproveSignature setSignatureDetails={setSignatureDetails} />
          }
        />
        <Route
          path={TopLevelRoute.ConfirmSignature}
          element={<ConfirmSignature details={signatureDetails} />}
        />
      </Routes>
    </Container>
  );
};
