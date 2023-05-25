import { Button, ButtonVariant } from "@anoma/components";
import { shortenAddress } from "@anoma/utils";

import { useQuery } from "hooks";
import { Address } from "App/Accounts/AccountListing.components";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";
import { ExtensionRequester } from "extension";
import { useNavigate } from "react-router-dom";
import { TopLevelRoute } from "Approvals/types";
import { Ports } from "router";
import { RejectTxMsg } from "background/approvals";

type Props = {
  setTxId: (txId: string) => void;
  requester: ExtensionRequester;
};

export const ApproveTx: React.FC<Props> = ({ setTxId, requester }) => {
  const navigate = useNavigate();

  const query = useQuery();
  // TODO: Get current parent account alias to display to user
  const id = query.get("id") || "";
  const amount = query.get("amount") || "";
  const source = query.get("source") || "";
  const target = query.get("target") || "";
  // TODO: Look up token type
  const token = query.get("token") || "";

  const handleApproveClick = (): void => {
    setTxId(id);
    navigate(TopLevelRoute.ConfirmTx);
  };

  const handleReject = async (): Promise<void> => {
    try {
      // TODO: use executeUntil here!
      await requester.sendMessage(Ports.Background, new RejectTxMsg(id));
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
      <p>Amount: {amount}</p>
      <Address>Token: {shortenAddress(token)}</Address>

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
