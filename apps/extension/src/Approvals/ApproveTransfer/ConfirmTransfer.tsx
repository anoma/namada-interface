import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, ButtonVariant, Input, InputVariants } from "@anoma/components";
import { shortenAddress } from "@anoma/utils";

import { Status } from "Approvals/Approvals";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";
import { Ports } from "router";
import { useRequester } from "hooks/useRequester";
import { SubmitApprovedTransferMsg } from "background/approvals";
import { Address } from "App/Accounts/AccountListing.components";
import { closeCurrentTab } from "utils";

type Props = {
  msgId: string;
  address: string;
};

export const ConfirmTransfer: React.FC<Props> = ({ msgId, address }) => {
  const navigate = useNavigate();
  const requester = useRequester();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();

  const handleApprove = async (): Promise<void> => {
    setStatus(Status.Pending);
    try {
      // TODO: use executeUntil here!
      await requester.sendMessage(
        Ports.Background,
        new SubmitApprovedTransferMsg(msgId, address, password)
      );
      setStatus(Status.Completed);
    } catch (e) {
      setError("Unable to authenticate Tx!");
      setStatus(Status.Failed);
    }
    return;
  };

  useEffect(() => {
    (async () => {
      if (status === Status.Completed) {
        await closeCurrentTab();
      }
    })();
  }, [status]);

  return (
    <ApprovalContainer>
      {status === Status.Pending && (
        <p>Decrypting keys and submitting transfer...</p>
      )}
      {status === Status.Failed && (
        <p>
          {error}
          <br />
          Try again
        </p>
      )}
      {status !== (Status.Pending || Status.Completed) && (
        <>
          <div>
            Decrypt keys for <Address>{shortenAddress(address)}</Address>
          </div>
          <Input
            variant={InputVariants.Password}
            label={"Password"}
            onChangeCallback={(e) => setPassword(e.target.value)}
          />
          <ButtonContainer>
            <Button
              onClick={handleApprove}
              disabled={!password}
              variant={ButtonVariant.Contained}
            >
              Authenticate
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant={ButtonVariant.Contained}
            >
              Back
            </Button>
          </ButtonContainer>
        </>
      )}
    </ApprovalContainer>
  );
};
