import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Alert, Input, Stack } from "@namada/components";
import { PageHeader } from "App/Common";
import { ApprovalDetails } from "Approvals/Approvals";
import { SignMaspMsg, SubmitApprovedSignTxMsg } from "background/approvals";
import { CheckPasswordMsg, CheckRequiresAuthMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { StatusBox } from "./StatusBox";
import { Status } from "./types";

type Props = {
  details: ApprovalDetails;
};

export const ConfirmSignTx: React.FC<Props> = ({ details }) => {
  const { msgId, signer, txType } = details;

  const navigate = useNavigate();
  const requester = useRequester();
  const [password, setPassword] = useState("");
  const [requiresAuth, setRequiresAuth] = useState<boolean>();
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");

  const signTx = async (): Promise<void> => {
    try {
      setStatus(Status.Pending);
      if (
        txType === "Unshielding" ||
        txType === "Shielded" ||
        txType === "IbcUnshieldTransfer"
      ) {
        await requester.sendMessage(
          Ports.Background,
          new SignMaspMsg(msgId, signer)
        );
      }

      await requester.sendMessage(
        Ports.Background,
        new SubmitApprovedSignTxMsg(msgId, signer)
      );
    } catch (e) {
      setError(`${e}`);
      setStatus(Status.Failed);
    }
  };

  const handleApproveSignTx = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      try {
        if (requiresAuth) {
          setStatusInfo(`Decrypting keys and signing transaction...`);
          const isAuthenticated = await requester.sendMessage(
            Ports.Background,
            new CheckPasswordMsg(password)
          );

          if (!isAuthenticated) {
            throw new Error("Invalid password!");
          }
        }

        await signTx();
        setStatus(Status.Completed);
      } catch (e) {
        setError(`${e}`);
        setStatus(Status.Failed);
      }
    },
    [requiresAuth, password]
  );

  useEffect(() => {
    if (!status && typeof requiresAuth === "undefined") {
      requester
        .sendMessage(Ports.Background, new CheckRequiresAuthMsg())
        .then((isAuthRequired) => {
          setRequiresAuth(isAuthRequired);
        })
        .catch((e) => console.error(e));
    }

    if (typeof requiresAuth !== "undefined" && !requiresAuth) {
      // User is authenticated with a valid session, so submit signed Tx:
      signTx()
        .then(() => setStatus(Status.Completed))
        .catch((e) => {
          setError(`${e}`);
          setStatus(Status.Failed);
        });
    }

    if (status === Status.Completed) {
      void closeCurrentTab();
    }
  }, [status, requiresAuth]);

  return (
    <Stack full className="py-4">
      <PageHeader title={requiresAuth ? "Verify" : "Signing transaction"} />
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
        {!requiresAuth && <Alert type="warning">Submitting signature</Alert>}
        <div className="flex-1" />
        <Stack gap={2}>
          {requiresAuth && (
            <>
              <ActionButton disabled={!password || status === Status.Pending}>
                Authenticate
              </ActionButton>
              <ActionButton
                outlineColor="yellow"
                type="button"
                onClick={() => navigate(-1)}
              >
                Back
              </ActionButton>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
