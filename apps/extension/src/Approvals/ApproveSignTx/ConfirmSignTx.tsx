import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Alert, Input, Stack } from "@namada/components";
import { ApprovalDetails, Status } from "Approvals/Approvals";
import {
  SubmitApprovedSignBatchTxMsg,
  SubmitApprovedSignTxMsg,
} from "background/approvals";
import { UnlockVaultMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  details?: ApprovalDetails;
};

export const ConfirmSignTx: React.FC<Props> = ({ details }) => {
  const { msgId, signer, signType } = details || {};

  const navigate = useNavigate();
  const requester = useRequester();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");

  const handleApproveSignTx = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      setStatus(Status.Pending);
      setStatusInfo(`Decrypting keys and signing transaction...`);

      try {
        if (!msgId) {
          throw new Error("msgId was not provided!");
        }
        if (!signer) {
          throw new Error("signer not provided!");
        }

        const isAuthenticated = await requester.sendMessage(
          Ports.Background,
          new UnlockVaultMsg(password)
        );

        if (!isAuthenticated) {
          throw new Error("Invalid password!");
        }

        await requester.sendMessage(
          Ports.Background,
          signType === "batch" ?
            new SubmitApprovedSignBatchTxMsg(msgId, signer)
            : new SubmitApprovedSignTxMsg(msgId, signer)
        );

        setStatus(Status.Completed);
      } catch (e) {
        console.info(e);
        setError(`${e}`);
        setStatus(Status.Failed);
      }
    },
    [password]
  );

  useEffect(() => {
    if (status === Status.Completed) {
      void closeCurrentTab();
    }
  }, [status]);

  return (
    <Stack gap={4} as="form" onSubmit={handleApproveSignTx}>
      {status === Status.Pending && <Alert type="info">{statusInfo}</Alert>}
      {status === Status.Failed && (
        <Alert type="error">
          {error}
          <br />
          Try again
        </Alert>
      )}
      {status !== (Status.Pending || Status.Completed) && (
        <>
          <Alert type="warning">Verify your password to continue</Alert>
          <Input
            variant="Password"
            label={"Password"}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Stack gap={3} direction="horizontal">
            <ActionButton disabled={!password}>Authenticate</ActionButton>
            <ActionButton onClick={() => navigate(-1)}>Back</ActionButton>
          </Stack>
        </>
      )}
    </Stack>
  );
};
