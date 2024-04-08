import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Alert, Input, Stack } from "@namada/components";
import { SupportedTx, TxType, TxTypeLabel } from "@namada/sdk/web";
import { shortenAddress } from "@namada/utils";
import { ApprovalDetails, Status } from "Approvals/Approvals";
import { SubmitApprovedTxMsg } from "background/approvals";
import { UnlockVaultMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { FetchAndStoreMaspParamsMsg, HasMaspParamsMsg } from "provider";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  details?: ApprovalDetails;
};

export const ConfirmTx: React.FC<Props> = ({ details }) => {
  const { source, msgId, txType } = details || {};

  const navigate = useNavigate();
  const requester = useRequester();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");

  const handleApproveTx = useCallback(async (): Promise<void> => {
    setStatus(Status.Pending);
    setStatusInfo(
      `Decrypting keys and submitting ${TxTypeLabel[txType as TxType]}...`
    );

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

      requester
        .sendMessage(
          Ports.Background,
          new SubmitApprovedTxMsg(txType as SupportedTx, msgId)
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
      {status !== (Status.Pending || Status.Completed) && source && (
        <>
          <Alert type="warning">
            Decrypt keys for{" "}
            <strong className="text-xs">{shortenAddress(source)}</strong>
          </Alert>
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
