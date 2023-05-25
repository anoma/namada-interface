import { useState } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import { Button, ButtonVariant, Input, InputVariants } from "@anoma/components";

import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { SubmitApprovedTxMsg } from "background/approvals";

type Props = {
  txId: string;
  requester: ExtensionRequester;
};

export const ConfirmTx: React.FC<Props> = ({ txId, requester }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleApprove = async (): Promise<void> => {
    // TODO: use executeUntil here!
    try {
      await requester.sendMessage(
        Ports.Background,
        new SubmitApprovedTxMsg(txId, password)
      );
      const tab = await browser.tabs.getCurrent();
      if (tab.id) {
        browser.tabs.remove(tab.id);
      }
    } catch (e) {
      console.warn(e);
    }
    return;
  };

  return (
    <ApprovalContainer>
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
        <Button onClick={() => navigate(-1)} variant={ButtonVariant.Contained}>
          Cancel
        </Button>
      </ButtonContainer>
    </ApprovalContainer>
  );
};
