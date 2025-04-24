import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { Container } from "@namada/components";
import { AccountType, TxDetails } from "@namada/types";

import { AppHeader } from "App/Common/AppHeader";
import { TopLevelRoute } from "Approvals/types";
import { CheckIsLockedMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { ApproveConnection } from "./ApproveConnection";
import { ApproveDisconnection } from "./ApproveDisconnection";
import { ApproveSignArbitrary } from "./ApproveSignArbitrary";
import { ApproveSignTx } from "./ApproveSignTx";
import { ApproveUpdateDefaultAccount } from "./ApproveUpdateDefaultAccount";
import { ConfirmSignature } from "./ConfirmSignArbitrary";
import { ConfirmSignLedgerTx } from "./ConfirmSignLedgerTx";
import { ConfirmSignTx } from "./ConfirmSignTx";
import { WithAuth } from "./WithAuth";

export type ExtensionLockContextType = {
  isUnlocked?: boolean;
  setIsUnlocked?: Dispatch<SetStateAction<boolean>>;
};
export const ExtensionLockContext =
  React.createContext<ExtensionLockContextType>({});

export type ApprovalDetails = {
  signer: string;
  accountType: AccountType;
  origin: string;
  chainIds: string[];
  msgId: string;
  txDetails: TxDetails[];
  txType?: string;
};

export type SignArbitraryDetails = {
  msgId: string;
  signer: string;
  data: string;
  origin: string;
};

export const Approvals: React.FC = () => {
  const [details, setDetails] = useState<ApprovalDetails>();
  const [signArbitraryDetails, setSignArbitraryDetails] =
    useState<SignArbitraryDetails>();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const requester = useRequester();

  useEffect(() => {
    requester
      .sendMessage(Ports.Background, new CheckIsLockedMsg())
      .then((isLocked) => {
        setIsUnlocked!(!isLocked);
      })
      .catch(() => setIsUnlocked!(false));
  }, []);

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
      <ExtensionLockContext.Provider
        value={{
          isUnlocked,
          setIsUnlocked,
        }}
      >
        <Routes>
          <Route
            path={`${TopLevelRoute.ApproveSignTx}/:msgId/:origin/:accountType/:signer`}
            element={
              <WithAuth>
                <ApproveSignTx details={details} setDetails={setDetails} />
              </WithAuth>
            }
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
            element={
              <WithAuth>
                <ApproveConnection />
              </WithAuth>
            }
          />
          <Route
            path={TopLevelRoute.ApproveDisconnection}
            element={
              <WithAuth>
                <ApproveDisconnection />
              </WithAuth>
            }
          />
          <Route
            path={TopLevelRoute.ApproveUpdateDefaultAccount}
            element={
              <WithAuth>
                <ApproveUpdateDefaultAccount />
              </WithAuth>
            }
          />
          <Route
            path={`${TopLevelRoute.ApproveSignArbitrary}/:origin/:signer`}
            element={
              <WithAuth>
                <ApproveSignArbitrary
                  setSignArbitraryDetails={setSignArbitraryDetails}
                />
              </WithAuth>
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
      </ExtensionLockContext.Provider>
    </Container>
  );
};
