import { useCallback, useState } from "react";
import { LedgerError } from "@namada/ledger-namada";
import { toBase64 } from "@cosmjs/encoding";

import { Button, ButtonVariant } from "@namada/components";

import { Ledger } from "background/ledger";
import {
  GetTransferBytesMsg,
  SubmitSignedTransferMsg,
} from "background/ledger/messages";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { useRequester } from "hooks/useRequester";
import { Status } from "Approvals/Approvals";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";

type Props = {
  msgId: string;
};

export const ConfirmLedgerTransfer: React.FC<Props> = ({ msgId }) => {
  const requester = useRequester();
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();

  const submitTransfer = async (): Promise<void> => {
    setStatus(Status.Pending);
    const ledger = await Ledger.init();

    try {
      // Constuct tx bytes from SDK
      const { bytes, path } = await requester.sendMessage(
        Ports.Background,
        new GetTransferBytesMsg(msgId)
      );

      // Sign with Ledger
      const signatures = await ledger.sign(bytes, path);
      const { errorMessage, returnCode } = signatures;

      // Close transport so that it may be re-opened on a subsequent attempt (due to error)
      await ledger.closeTransport();

      if (returnCode !== LedgerError.NoErrors) {
        setError(errorMessage);
        return setStatus(Status.Failed);
      }

      // Submit signatures for tx
      await requester.sendMessage(
        Ports.Background,
        new SubmitSignedTransferMsg(msgId, toBase64(bytes), signatures)
      );
      setStatus(Status.Completed);
    } catch (e) {
      console.warn(e);
      const ledgerErrors = await ledger.queryErrors();
      setError(ledgerErrors);
      setStatus(Status.Failed);
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
      {status === Status.Pending && <p>Submitting transfer...</p>}
      {status !== Status.Pending && status !== Status.Completed && (
        <>
          <p>Make sure your Ledger is unlocked, and click &quot;Submit&quot;</p>
          <ButtonContainer>
            <Button variant={ButtonVariant.Contained} onClick={submitTransfer}>
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
