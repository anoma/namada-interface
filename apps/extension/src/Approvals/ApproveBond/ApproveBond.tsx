import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";

import { Button, ButtonVariant } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { AccountType, Tokens } from "@namada/types";

import { useQuery } from "hooks";
import { Address } from "App/Accounts/AccountListing.components";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";
import { TopLevelRoute } from "Approvals/types";
import { Ports } from "router";
import { RejectTxMsg } from "background/approvals";
import { useRequester } from "hooks/useRequester";
import { closeCurrentTab } from "utils";

type Props = {
  setAddress: (address: string) => void;
  setMsgId: (msgId: string) => void;
  setPublicKey: (publicKey: string) => void;
};

export const ApproveBond: React.FC<Props> = ({
  setAddress,
  setMsgId,
  setPublicKey,
}) => {
  const navigate = useNavigate();
  const requester = useRequester();

  const query = useQuery();
  const type = query.get("type") || "";
  const id = query.get("id") || "";
  const amount = query.get("amount") || "";
  const source = query.get("source") || "";
  const tokenAddress = query.get("token") || "";
  const tokenType =
    Object.values(Tokens).find((token) => token.address === tokenAddress)
      ?.symbol || "";
  const publicKey = query.get("publicKey") || "";

  useEffect(() => {
    if (source) {
      setAddress(source);
    }
    if (publicKey) {
      setPublicKey(publicKey);
    }
  }, [source, publicKey]);

  const handleApproveClick = (): void => {
    setMsgId(id);
    if (type === AccountType.Ledger) {
      return navigate(`${TopLevelRoute.ConfirmLedgerBond}`);
    }
    navigate(TopLevelRoute.ConfirmBond);
  };

  const handleReject = useCallback(async (): Promise<void> => {
    try {
      // TODO: use executeUntil here!
      await requester.sendMessage(Ports.Background, new RejectTxMsg(id));

      // Close tab
      await closeCurrentTab();
    } catch (e) {
      console.warn(e);
    }
    return;
  }, [id]);

  return (
    <ApprovalContainer>
      <p>Approve this Bond?</p>
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
