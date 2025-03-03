import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Input, Stack } from "@namada/components";
import { PageHeader } from "App/Common";
import { ApprovalDetails, Status } from "Approvals/Approvals";
import { SignMaspMsg, SubmitApprovedSignTxMsg } from "background/approvals";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { StatusBox } from "./StatusBox";

type Props = {
  details: ApprovalDetails;
};

export const ConfirmSignTx: React.FC<Props> = ({ details }) => {
  const { msgId, signer, txType } = details;

  const navigate = useNavigate();
  const requester = useRequester();
  const [_password, setPassword] = useState("");
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");

  const handleApproveSignTx = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      setStatus(Status.Pending);
      setStatusInfo(`Decrypting keys and signing transaction...`);

      try {
        if (txType === "Unshielding" || txType === "Shielded") {
          await requester.sendMessage(
            Ports.Background,
            new SignMaspMsg(msgId, signer)
          );
        }

        await requester.sendMessage(
          Ports.Background,
          new SubmitApprovedSignTxMsg(msgId, signer)
        );

        setStatus(Status.Completed);
      } catch (e) {
        setError(`${e}`);
        setStatus(Status.Failed);
      }
    },
    []
  );

  useEffect(() => {
    if (status === Status.Completed) {
      void closeCurrentTab();
    }
    // TODO:
    setRequiresAuth(false);
  }, [status]);

  return (
    <Stack full className="py-4">
      <PageHeader title="Verify" />
      <Stack full as="form" onSubmit={handleApproveSignTx}>
        {requiresAuth && (
          <>
            <StatusBox
              status={status}
              idleText="Verify your password to continue"
              pendingText={statusInfo}
              errorText={error}
            />
            <Input
              variant="Password"
              label={"Password"}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}
        <div className="flex-1" />
        <Stack gap={2}>
          <ActionButton disabled={requiresAuth || status === Status.Pending}>
            Authenticate
          </ActionButton>
          <ActionButton
            outlineColor="yellow"
            type="button"
            onClick={() => navigate(-1)}
          >
            Reject
          </ActionButton>
        </Stack>
      </Stack>
    </Stack>
  );
};
