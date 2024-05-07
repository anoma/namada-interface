import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { Container } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { AccountType } from "@namada/types";
import { TxType } from "@heliax/namada-sdk/web";

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

export type ApprovalDetails = {
  signer: string;
  txType: TxType;
  accountType: AccountType;
  msgId: string;
};

export type SignatureDetails = {
  msgId: string;
  signer: string;
};

export const Approvals: React.FC = () => {
  const [details, setDetails] = useState<ApprovalDetails>();
  const [signatureDetails, setSignatureDetails] = useState<SignatureDetails>();
  const params = useSanitizedParams();
  const txType = parseInt(params?.type || "0");
  const accountType =
    (params?.accountType as AccountType) || AccountType.PrivateKey;
  const msgId = params?.msgId || "0";
  const signer = params?.signer;

  // TODO: Define all dependencies
  useEffect(() => {
    if (signer) {
      setDetails({
        txType,
        accountType,
        msgId,
        signer,
      });
    }
  }, [signer]);

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
          element={<ApproveTx details={details} />}
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
