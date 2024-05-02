import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { TxTypeLabel } from "@heliax/namada-sdk/web";
import { ActionButton, Alert, Input, Stack } from "@namada/components";
import { ApprovalDetails, Status } from "Approvals/Approvals";
import { UnlockVaultMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { FetchAndStoreMaspParamsMsg, HasMaspParamsMsg } from "provider";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  details?: ApprovalDetails;
};

export const ConfirmTx: React.FC<Props> = ({ details }) => {
  const { msgId, txType } = details || {};

  const navigate = useNavigate();
  const requester = useRequester();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");

  const handleApproveTx = useCallback(async (): Promise<void> => {
    if (!txType) {
      // TODO: What would be a better handling of this? txType should be defined
      throw new Error("txType should be defined");
    }
    setStatus(Status.Pending);
    setStatusInfo(`Decrypting keys and submitting ${TxTypeLabel[txType]}...`);

    try {
      if (!msgId) {
        throw new Error("msgId was not provided!");
      }

      const isAuthenticated = await requester.sendMessage(
        Ports.Background,
        new UnlockVaultMsg(password)
      );

      if (!isAuthenticated) {
        throw new Error("Invalid password!");
      }

      const hasMaspParams = await requester.sendMessage(
        Ports.Background,
        new HasMaspParamsMsg()
      );

      if (!hasMaspParams) {
        setStatusInfo("Fetching MASP parameters...");
        try {
          await requester.sendMessage(
            Ports.Background,
            new FetchAndStoreMaspParamsMsg()
          );
        } catch (e) {
          setError(`Fetching MASP parameters failed: ${e}`);
          setStatus(Status.Failed);
        }
      }

      // TODO: Return signed Tx!

      setStatus(Status.Completed);
    } catch (e) {
      console.info(e);
      setError(`${e}`);
      setStatus(Status.Failed);
    }
  }, [password]);

  useEffect(() => {
    if (status === Status.Completed) {
      void closeCurrentTab();
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
      {status !== (Status.Pending || Status.Completed) && (
        <>
          <Alert type="warning">Verify your password to continue</Alert>
          <Input
            variant="Password"
            label={"Password"}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Stack gap={3} direction="horizontal">
            <ActionButton onClick={handleApproveTx} disabled={!password}>
              Authenticate
            </ActionButton>
            <ActionButton onClick={() => navigate(-1)}>Back</ActionButton>
          </Stack>
        </>
      )}
    </Stack>
  );
};
