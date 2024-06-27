import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { Container } from "@namada/components";
import { AccountType, TxDetails } from "@namada/types";

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
  accountType: AccountType;
  msgId: string;
  txDetails: TxDetails;
};

export type SignArbitraryDetails = {
  msgId: string;
  signer: string;
};

export const Approvals: React.FC = () => {
  const [details, setDetails] = useState<ApprovalDetails>();
  const [signArbitraryDetails, setSignArbitraryDetails] =
    useState<SignArbitraryDetails>();

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
          element={<ApproveSignTx setDetails={setDetails} />}
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
            <ApproveSignArbitrary
              setSignArbitraryDetails={setSignArbitraryDetails}
            />
          }
        />
        <Route
          path={TopLevelRoute.ConfirmSignArbitrary}
          element={<ConfirmSignature details={signArbitraryDetails} />}
        />
      </Routes>
    </Container>
  );
};
