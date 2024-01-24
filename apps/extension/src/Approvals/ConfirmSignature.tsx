import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Alert, Input, Stack } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { SignatureDetails, Status } from "Approvals/Approvals";
import { SubmitApprovedSignatureMsg } from "background/approvals";
import { UnlockVaultMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  details?: SignatureDetails;
};

export const ConfirmSignature: React.FC<Props> = ({ details }) => {
  const { msgId, signer } = details || {};

  const navigate = useNavigate();
  const requester = useRequester();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");

  const handleApproveSignature = useCallback(async (): Promise<void> => {
    if (!msgId || !signer) {
      throw new Error("Not all required arguments were provided!");
    }

    setStatus(Status.Pending);
    setStatusInfo(
      `Decrypting keys and signing with ${shortenAddress(signer, 24)}`
    );

    try {
      const isAuthenticated = await requester.sendMessage(
        Ports.Background,
        new UnlockVaultMsg(password)
      );

      if (!isAuthenticated) {
        throw new Error("Invalid password!");
      }

      await requester
        .sendMessage(
          Ports.Background,
          new SubmitApprovedSignatureMsg(msgId, signer)
        )
        .catch((e) => {
          throw new Error(e);
        });
      setStatus(Status.Completed);
    } catch (e) {
      console.info(e);
      setError(`${e}`);
      setStatus(Status.Failed);
    }
  }, [password]);

  useEffect(() => {
    if (status === Status.Completed) {
      closeCurrentTab();
    }
  }, [status]);

  return (
    <Stack gap={4}>
      {status === Status.Pending && <Alert type="info">{statusInfo}</Alert>}
      {status === Status.Failed && (
        <Alert type="error">
          {error}
          <br />
          Try again
        </Alert>
      )}
      {status !== (Status.Pending || Status.Completed) && signer && (
        <>
          <Alert type="warning">
            Decrypt keys for{" "}
            <strong className="text-xs">{shortenAddress(signer)}</strong>
          </Alert>
          <Input
            variant="Password"
            label={"Password"}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Stack gap={3} direction="horizontal">
            <ActionButton onClick={handleApproveSignature} disabled={!password}>
              Authenticate
            </ActionButton>
            <ActionButton onClick={() => navigate(-1)}>Back</ActionButton>
          </Stack>
        </>
      )}
    </Stack>
  );
};
