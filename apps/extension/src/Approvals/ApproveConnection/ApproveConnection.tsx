import { Button, ButtonVariant } from "@anoma/components";
import { useQuery } from "hooks";

import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";

export const ApproveConnection: React.FC = () => {
  const params = useQuery();
  const chainId = params.get("chainId");

  return (
    <ApprovalContainer>
      <p>
        Approve connection for chain <strong>{chainId}</strong>?
      </p>
      <ButtonContainer>
        <Button variant={ButtonVariant.Contained}>Approve</Button>
        <Button variant={ButtonVariant.Contained}>Reject</Button>
      </ButtonContainer>
    </ApprovalContainer>
  );
};
