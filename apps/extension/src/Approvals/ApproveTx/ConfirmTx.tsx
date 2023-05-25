import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import { Button, ButtonVariant, Input, InputVariants } from "@anoma/components";
import { Status } from "Approvals/Approvals";

import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { SubmitApprovedTxMsg } from "background/approvals";
import { shortenAddress } from "@anoma/utils";
import { Address } from "App/Accounts/AccountListing.components";

type Props = {
  txId: string;
  address: string;
  requester: ExtensionRequester;
};

export const ConfirmTx: React.FC<Props> = ({ txId, address, requester }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();

  const handleApprove = async (): Promise<void> => {
    setStatus(Status.Pending);
    try {
      // TODO: use executeUntil here!
      await requester.sendMessage(
        Ports.Background,
        new SubmitApprovedTxMsg(txId, address, password)
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
        const tab = await browser.tabs.getCurrent();
        if (tab.id) {
          browser.tabs.remove(tab.id);
        }
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
