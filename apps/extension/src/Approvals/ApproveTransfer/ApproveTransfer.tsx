import browser from "webextension-polyfill";
import { useNavigate } from "react-router-dom";

import { Button, ButtonVariant } from "@anoma/components";
import { shortenAddress } from "@anoma/utils";
import { Tokens } from "@anoma/types";

import { useQuery } from "hooks";
import { Address } from "App/Accounts/AccountListing.components";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";
import { TopLevelRoute } from "Approvals/types";
import { Ports } from "router";
import { RejectTransferMsg } from "background/approvals";
import { useEffect } from "react";
import { useRequester } from "hooks/useRequester";

type Props = {
  setMsgId: (msgId: string) => void;
  setAddress: (address: string) => void;
};

export const ApproveTransfer: React.FC<Props> = ({ setAddress, setMsgId }) => {
  const navigate = useNavigate();
  const requester = useRequester();

  const query = useQuery();
  // TODO: Get current parent account alias to display to user
  const id = query.get("id") || "";
  const amount = query.get("amount") || "";
  const source = query.get("source") || "";
  const target = query.get("target") || "";
  const tokenAddress = query.get("token") || "";
  const tokenType =
    Object.values(Tokens).find((token) => token.address === tokenAddress)
      ?.symbol || "";

  useEffect(() => {
    if (source) {
      setAddress(source);
    }
  }, [source]);

  const handleApproveClick = (): void => {
    setMsgId(id);
    navigate(TopLevelRoute.ConfirmTx);
  };

  const handleReject = async (): Promise<void> => {
    try {
      // TODO: use executeUntil here!
      await requester.sendMessage(Ports.Background, new RejectTransferMsg(id));

      // Close tab
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
      <p>Approve this Transaction?</p>
      <p>ID: {id}</p>
      <p>Target:&nbsp;</p>
      <Address>{shortenAddress(target)}</Address>
      <p>Source:&nbsp;</p>
      <Address>{shortenAddress(source)}</Address>
      <p>
        Amount: {amount} {tokenType}
      </p>

      <ButtonContainer>
        <Button onClick={handleApproveClick} variant={ButtonVariant.Contained}>
          Approve
        </Button>
        <Button onClick={handleReject} variant={ButtonVariant.Contained}>
          Reject
        </Button>
      </ButtonContainer>
    </ApprovalContainer>
  );
};
