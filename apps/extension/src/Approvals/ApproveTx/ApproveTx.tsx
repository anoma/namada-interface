import { useSanitizedParams } from "@anoma/hooks";
import { Button, ButtonVariant } from "@anoma/components";
import { shortenAddress } from "@anoma/utils";

import { Address } from "App/Accounts/AccountListing.components";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";

export const ApproveTx: React.FC = ({ }) => {
  const params = useSanitizedParams();
  const { amount = 0, source = "", target = "", token = "" } = params;

  return (
    <ApprovalContainer>
      <p>Approve this Transaction?</p>
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
