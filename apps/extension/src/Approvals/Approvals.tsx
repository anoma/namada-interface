import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { TxType } from "@heliax/namada-sdk/web";
import { Container } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { AccountType } from "@namada/types";

import { AppHeader } from "App/Common/AppHeader";
import { TopLevelRoute } from "Approvals/types";
import { ApproveConnection } from "./ApproveConnection";
import { ApproveSignArbitrary } from "./ApproveSignArbitrary";
import {
  ApproveSignTx,
  ConfirmSignLedgerTx,
  ConfirmSignTx,
} from "./ApproveSignTx";
import { ConfirmSignature } from "./ConfirmSignArbitrary";

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
          path={`${TopLevelRoute.ApproveSignTx}/:msgId/:accountType/:signer`}
          element={<ApproveSignTx details={details} />}
        />
        <Route
          path={TopLevelRoute.ConfirmSignTx}
          element={<ConfirmSignTx details={details} />}
        />
        <Route
          path={TopLevelRoute.ConfirmLedgerTx}
          element={<ConfirmSignLedgerTx details={details} />}
        />
        <Route
          path={TopLevelRoute.ApproveConnection}
          element={<ApproveConnection />}
        />
        <Route
          path={`${TopLevelRoute.ApproveSignArbitrary}/:signer`}
          element={
            <ApproveSignArbitrary setSignatureDetails={setSignatureDetails} />
          }
        />
        <Route
          path={TopLevelRoute.ConfirmSignArbitrary}
          element={<ConfirmSignature details={signatureDetails} />}
        />
      </Routes>
    </Container>
  );
};
