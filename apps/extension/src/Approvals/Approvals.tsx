import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { Container } from "@namada/components";
import { AccountType, TxDetails } from "@namada/types";

import { AppHeader } from "App/Common/AppHeader";
import { TopLevelRoute } from "Approvals/types";
import { ApproveConnection } from "./ApproveConnection";
import { ApproveDisconnection } from "./ApproveDisconnection";
import { ApproveSignArbitrary } from "./ApproveSignArbitrary";
import { ApproveSignTx } from "./ApproveSignTx";
import { ApproveUpdateDefaultAccount } from "./ApproveUpdateDefaultAccount";
import { ConfirmSignature } from "./ConfirmSignArbitrary";
import { ConfirmSignLedgerTx } from "./ConfirmSignLedgerTx";
import { ConfirmSignTx } from "./ConfirmSignTx";

export enum Status {
  Completed,
  Pending,
  Failed,
}

export type ApprovalDetails = {
  signer: string;
  accountType: AccountType;
  msgId: string;
  txDetails: TxDetails[];
};

export type SignArbitraryDetails = {
  msgId: string;
  signer: string;
  data: string;
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
          element={<ApproveSignTx details={details} setDetails={setDetails} />}
        />
        <Route
          path={TopLevelRoute.ConfirmSignTx}
          element={details && <ConfirmSignTx details={details} />}
        />
        <Route
          path={TopLevelRoute.ConfirmLedgerTx}
          element={details && <ConfirmSignLedgerTx details={details} />}
        />
        <Route
          path={TopLevelRoute.ApproveConnection}
          element={<ApproveConnection />}
        />
        <Route
          path={TopLevelRoute.ApproveDisconnection}
          element={<ApproveDisconnection />}
        />
        <Route
          path={TopLevelRoute.ApproveUpdateDefaultAccount}
          element={<ApproveUpdateDefaultAccount />}
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
          element={
            signArbitraryDetails && (
              <ConfirmSignature details={signArbitraryDetails} />
            )
          }
        />
      </Routes>
    </Container>
  );
};
