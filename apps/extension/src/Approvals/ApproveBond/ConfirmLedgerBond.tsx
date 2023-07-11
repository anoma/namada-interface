import { useCallback, useState } from "react";
import { toBase64 } from "@cosmjs/encoding";

import { LedgerError } from "@anoma/ledger-namada";
import { Button, ButtonVariant } from "@anoma/components";

import { Ledger } from "background/ledger";
import {
  GetBondBytesMsg,
  SubmitSignedBondMsg,
} from "background/ledger/messages";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { useRequester } from "hooks/useRequester";
import { Status } from "Approvals/Approvals";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";
import { InfoHeader, InfoLoader } from "Approvals/Approvals.components";

type Props = {
  msgId: string;
};

export const ConfirmLedgerBond: React.FC<Props> = ({ msgId }) => {
  const requester = useRequester();
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");

  const submitBond = async (): Promise<void> => {
    setStatus(Status.Pending);
    setStatusInfo("Review and approve transaction on your Ledger");
    const ledger = await Ledger.init();

    try {
      // Constuct tx bytes from SDK
      const { bytes, path } = await requester.sendMessage(
        Ports.Background,
        new GetBondBytesMsg(msgId)
      );

      // Sign with Ledger
      const signatures = await ledger.sign(bytes, path);
      const { errorMessage, returnCode } = signatures;

      if (returnCode !== LedgerError.NoErrors) {
        setError(errorMessage);
        return setStatus(Status.Failed);
      }

      // Submit signatures for tx
      setStatusInfo("Submitting transaction...");
      await requester.sendMessage(
        Ports.Background,
        new SubmitSignedBondMsg(msgId, toBase64(bytes), signatures)
      );
      setStatus(Status.Completed);
    } catch (e) {
      console.warn(e);
      const ledgerErrors = await ledger.queryErrors();
      setError(ledgerErrors);
      setStatus(Status.Failed);
    } finally {
      ledger.closeTransport();
    }
  };

  const handleCloseTab = useCallback(async (): Promise<void> => {
    await closeCurrentTab();
  }, []);

  return (
    <ApprovalContainer>
      {status === Status.Failed && (
        <p>
          {error}
          <br />
          Try again
        </p>
      )}
      {status === Status.Pending && (
        <InfoHeader>
          <InfoLoader />
          {statusInfo}
        </InfoHeader>
      )}
      {status !== Status.Pending && status !== Status.Completed && (
        <>
          <p>Make sure your Ledger is unlocked, and click &quot;Submit&quot;</p>
          <ButtonContainer>
            <Button variant={ButtonVariant.Contained} onClick={submitBond}>
              Submit
            </Button>
          </ButtonContainer>
        </>
      )}
      {status === Status.Completed && (
        <>
          <p>Success! You may close this window.</p>
          <ButtonContainer>
            <Button variant={ButtonVariant.Contained} onClick={handleCloseTab}>
              Close
            </Button>
          </ButtonContainer>
        </>
      )}
    </ApprovalContainer>
  );
};
