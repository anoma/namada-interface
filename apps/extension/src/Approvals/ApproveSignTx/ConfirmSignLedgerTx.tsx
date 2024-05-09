import { useCallback, useEffect, useState } from "react";

import { Ledger, TxType, TxTypeLabel } from "@heliax/namada-sdk/web";
import { ActionButton, Alert, Stack } from "@namada/components";
import { LedgerError } from "@zondax/ledger-namada";

import { ApprovalDetails, Status } from "Approvals/Approvals";
import { closeCurrentTab } from "utils";

type Props = {
  details?: ApprovalDetails;
};

export const ConfirmSignLedgerTx: React.FC<Props> = ({ details }) => {
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");
  const { msgId, txType } = details || {};

  useEffect(() => {
    if (status === Status.Completed) {
      void closeCurrentTab();
    }
  }, [status]);

  const signLedgerTx = async (
    ledger: Ledger,
    bytes: Uint8Array,
    path: string
  ): Promise<void> => {
    // Open ledger transport
    const txLabel = TxTypeLabel[txType as TxType];

    // Construct tx bytes from SDK
    if (!txType) {
      throw new Error("txType was not provided!");
    }
    if (!msgId) {
      throw new Error("msgId was not provided!");
    }

    setStatusInfo(`Review and approve ${txLabel} transaction on your Ledger`);

    try {
      // Sign with Ledger
      const signatures = await ledger.sign(bytes, path);
      const { errorMessage, returnCode } = signatures;

      if (returnCode !== LedgerError.NoErrors) {
        throw new Error(`Signing error encountered: ${errorMessage}`);
      }
      setStatus(Status.Completed);
    } catch (e) {
      await ledger.closeTransport();
      setError(`${e}`);
      setStatus(Status.Failed);
    }
  };

  const handleSubmitTx = useCallback(async (): Promise<void> => {
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
      // TODO: Bytes and Path will now be provided by interface when submitted for approval,
      // which is now responsible for building Tx!
      await signLedgerTx(ledger, new Uint8Array([]), "");
    } catch (e) {
      await ledger.closeTransport();
      setError(`${e}`);
      setStatus(Status.Failed);
    }
  }, []);

  return (
    <Stack gap={12}>
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
            <ActionButton onClick={handleSubmitTx}>Submit</ActionButton>
          </div>
        </>
      )}
    </Stack>
  );
};
