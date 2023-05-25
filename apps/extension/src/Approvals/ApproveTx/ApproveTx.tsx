import { Button, ButtonVariant } from "@anoma/components";
import { shortenAddress } from "@anoma/utils";

import { useQuery } from "hooks";
import { Address } from "App/Accounts/AccountListing.components";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";

export const ApproveTx: React.FC = () => {
  const query = useQuery();
  const id = query.get("id") || "";
  const amount = query.get("amount") || "";
  const source = query.get("source") || "";
  const target = query.get("target") || "";
  const token = query.get("token") || "";

  return (
    <ApprovalContainer>
      <p>Approve this Transaction?</p>
      <p>ID: {id}</p>
      <p>
        Target:&nbsp;
        <Address>{shortenAddress(target)}</Address>
      </p>
      <p>
        Source:&nbsp;
        <Address>{shortenAddress(source)}</Address>
      </p>
      <p>Ammount: {amount}</p>
      <p>Token: {token}</p>

      <ButtonContainer>
        <Button variant={ButtonVariant.Contained}>Approve</Button>
        <Button variant={ButtonVariant.Contained}>Reject</Button>
      </ButtonContainer>
    </ApprovalContainer>
  );
};
