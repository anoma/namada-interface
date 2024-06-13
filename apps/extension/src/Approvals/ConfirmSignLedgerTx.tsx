import { useCallback, useEffect, useState } from "react";

import { Ledger, makeBip44Path } from "@heliax/namada-sdk/web";
import { ActionButton, Alert, Stack } from "@namada/components";
import { LedgerError, ResponseSign } from "@zondax/ledger-namada";

import { fromBase64 } from "@cosmjs/encoding";
import { chains } from "@namada/chains";
import { ApprovalDetails, Status } from "Approvals/Approvals";
import {
  QueryPendingTxBytesMsg,
  SubmitApprovedSignLedgerTxMsg,
} from "background/approvals";
import { QueryAccountDetailsMsg } from "background/keyring";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  details: ApprovalDetails;
};

export const ConfirmSignLedgerTx: React.FC<Props> = ({ details }) => {
  const requester = useRequester();
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");
  const { msgId, signer } = details;

  useEffect(() => {
    if (status === Status.Completed) {
      void closeCurrentTab();
    }
  }, [status]);

  const signLedgerTx = async (
    ledger: Ledger,
    bytes: Uint8Array,
    path: string
  ): Promise<ResponseSign> => {
    // Open ledger transport
    setStatusInfo(`Review and approve transaction on your Ledger`);

    // Sign with Ledger
    const signatures = await ledger.sign(bytes, path);
    const { errorMessage, returnCode } = signatures;

    if (returnCode !== LedgerError.NoErrors) {
      throw new Error(`Signing error encountered: ${errorMessage}`);
    }
    return signatures;
  };

  const handleApproveLedgerSignTx = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      const ledger = await Ledger.init().catch((e) => {
        setError(`${e}`);
        setStatus(Status.Failed);
      });

      if (!ledger) {
        return;
      }

      const {
        version: { returnCode, errorMessage },
      } = await ledger.status();

      // Validate Ledger state first
      if (returnCode !== LedgerError.NoErrors) {
        await ledger.closeTransport();
        setError(errorMessage);
        return setStatus(Status.Failed);
      }

      setStatusInfo("Preparing transaction...");
      setStatus(Status.Pending);

      try {
        const accountDetails = await requester.sendMessage(
          Ports.Background,
          new QueryAccountDetailsMsg(signer)
        );
        if (!accountDetails) {
          throw new Error(`Failed to query account details for ${signer}`);
        }
        const path = makeBip44Path(
          chains.namada.bip44.coinType,
          accountDetails.path
        );
        const pendingTxBytes = await requester.sendMessage(
          Ports.Background,
          new QueryPendingTxBytesMsg(msgId)
        );

        if (!pendingTxBytes) {
          throw new Error(`Tx for msgId ${msgId} not found!`);
        }
        const signature = await signLedgerTx(
          ledger,
          fromBase64(pendingTxBytes),
          path
        );

        await requester.sendMessage(
          Ports.Background,
          new SubmitApprovedSignLedgerTxMsg(msgId, signature)
        );

        setStatus(Status.Completed);
        // TODO: We need a SubmitApprovedLedgerTx msg that accepts these bytes
      } catch (e) {
        await ledger.closeTransport();
        setError(`${e}`);
        setStatus(Status.Failed);
      }
    },
    []
  );

  return (
    <Stack gap={12} as="form" onSubmit={handleApproveLedgerSignTx}>
      {status !== Status.Pending && status !== Status.Completed && (
        <Alert type="warning">
          Make sure your Ledger is unlocked, and click &quot;Submit&quot;
        </Alert>
      )}
      {status === Status.Failed && (
        <Alert type="error">
          {error}
          <br />
          Try again
        </Alert>
      )}
      {status === Status.Pending && <Alert type="info">{statusInfo}</Alert>}
      {status !== Status.Pending && status !== Status.Completed && (
        <>
          <p className="text-white">
            Make sure your Ledger is unlocked, and click &quot;Submit&quot;
          </p>
          <div className="flex">
            <ActionButton>Submit</ActionButton>
          </div>
        </>
      )}
    </Stack>
  );
};
