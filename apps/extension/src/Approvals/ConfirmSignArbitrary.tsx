import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Alert,
  GapPatterns,
  Input,
  Stack,
} from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { PageHeader } from "App/Common";
import { SignArbitraryDetails } from "Approvals/Approvals";
import { SubmitApprovedSignArbitraryMsg } from "background/approvals";
import { CheckPasswordMsg, CheckRequiresAuthMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { Status } from "./types";

type Props = {
  details: SignArbitraryDetails;
};

export const ConfirmSignature: React.FC<Props> = ({ details }) => {
  const { msgId, signer } = details;

  const navigate = useNavigate();
  const requester = useRequester();
  const [requiresAuth, setRequiresAuth] = useState<boolean>();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");

  const signArbitrary = async (): Promise<void> => {
    try {
      setStatus(Status.Pending);
      setStatusInfo(`Signing keys with ${shortenAddress(signer, 24)}`);
      await requester
        .sendMessage(
          Ports.Background,
          new SubmitApprovedSignArbitraryMsg(msgId, signer)
        )
        .catch((e) => {
          throw new Error(e);
        });
      setStatus(Status.Completed);
    } catch (e) {
      throw new Error(`${e}`);
    }
  };

  const handleApproveSignature = useCallback(async (): Promise<void> => {
    try {
      if (requiresAuth) {
        setStatusInfo(`Decrypting keys and signing data...`);
        const isAuthenticated = await requester.sendMessage(
          Ports.Background,
          new CheckPasswordMsg(password)
        );

        if (!isAuthenticated) {
          throw new Error("Invalid password!");
        }
      }

      await signArbitrary();
      setStatus(Status.Completed);
    } catch (e) {
      setError(`${e}`);
      setStatus(Status.Failed);
    }
  }, [requiresAuth, password]);

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
      // User is authenticated with a valid session, so submit signed data
      signArbitrary()
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

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await handleApproveSignature();
  };

  return (
    <Stack
      as="form"
      onSubmit={onSubmit}
      full
      gap={GapPatterns.TitleContent}
      className="pt-4 pb-8"
    >
      <PageHeader
        title={requiresAuth ? "Confirm Signature" : "Submitting signature"}
      />
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
          <Stack full gap={4}>
            {requiresAuth && (
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
              </>
            )}
          </Stack>
          <Stack gap={3}>
            {requiresAuth && (
              <>
                <ActionButton disabled={!password}>Authenticate</ActionButton>
                <ActionButton
                  outlineColor="yellow"
                  onClick={() => navigate(-1)}
                >
                  Back
                </ActionButton>
              </>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
};
