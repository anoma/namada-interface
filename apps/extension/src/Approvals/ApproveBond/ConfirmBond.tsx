import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  ButtonVariant,
  Input,
  InputVariants,
} from "@namada/components";
import { shortenAddress } from "@namada/utils";

import { Status } from "Approvals/Approvals";
import {
  ApprovalContainer,
  ButtonContainer,
  InfoHeader,
  InfoLoader,
} from "Approvals/Approvals.components";
import { Ports } from "router";
import { useRequester } from "hooks/useRequester";
import { SubmitApprovedBondMsg } from "background/approvals";
import { Address } from "App/Accounts/AccountListing.components";
import { closeCurrentTab } from "utils";

type Props = {
  msgId: string;
  address: string;
};

export const ConfirmBond: React.FC<Props> = ({ msgId, address }) => {
  const navigate = useNavigate();
  const requester = useRequester();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState<string>("");

  const handleApproveBond = async (): Promise<void> => {
    setStatus(Status.Pending);
    try {
      // TODO: use executeUntil here!
      setStatusInfo("Decrypting keys and submitting transfer...");
      await requester.sendMessage(
        Ports.Background,
        new SubmitApprovedBondMsg(msgId, address, password)
      );
      setStatus(Status.Completed);
    } catch (e) {
      setError("Unable to authenticate Tx!");
      setStatus(Status.Failed);
    }
    setStatusInfo("");
    setStatus(Status.Completed);
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
        <InfoHeader>
          <InfoLoader />
          <p>{statusInfo}</p>
        </InfoHeader>
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
              onClick={handleApproveBond}
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
