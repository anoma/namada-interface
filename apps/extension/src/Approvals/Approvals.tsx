import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { Container } from "@namada/components";
import { TxType } from "@namada/shared";

import { AppHeader } from "App/Common/AppHeader";
import { TopLevelRoute } from "Approvals/types";
import { ApproveConnection } from "./ApproveConnection";
import { ApproveSignature } from "./ApproveSignature";
import { ApproveTx } from "./ApproveTx/ApproveTx";
import { ConfirmLedgerTx } from "./ApproveTx/ConfirmLedgerTx";
import { ConfirmTx } from "./ApproveTx/ConfirmTx";
import { ConfirmSignature } from "./ConfirmSignature";
import { RejectSignatureMsg, RejectTxMsg } from "background/approvals";
import { Ports } from "router";
import { useRequester } from "hooks/useRequester";
import { performUnloadCleanup } from "utils";

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
  nativeToken?: string;
};

export type SignatureDetails = {
  msgId: string;
  signer: string;
};

export const Approvals: React.FC = () => {
  const [details, setDetails] = useState<ApprovalDetails>();
  const [signatureDetails, setSignatureDetails] = useState<SignatureDetails>();
  const requester = useRequester();

  // Logic for canceling transactions/signatures when closing the window using the close-button.
  // Not really the cleanest place to put this, neither is the use of a shared variable (performUnloadCleanup).
  // TODO: extract this logic, perhaps by creating a separate context.
  useEffect(() => {
    const onUnload = async () => {
      if(performUnloadCleanup) {
        if(signatureDetails) {
          await requester.sendMessage(Ports.Background, new RejectSignatureMsg(signatureDetails.msgId));
        }
        
        if(details) {
          await requester.sendMessage(Ports.Background, new RejectTxMsg(details.msgId));
        }
      }
    }

    window.addEventListener('beforeunload', onUnload);

    return () => {
      window.removeEventListener('beforeunload', onUnload);
    }
  }, [performUnloadCleanup, signatureDetails, details])

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
