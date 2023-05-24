import { Button, ButtonVariant } from "@anoma/components";
import { useSanitizedParams } from "@anoma/hooks";

import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";

export const ApproveConnection: React.FC = () => {
  // const authorize = useAuth(requester);
  //
  // useEffect(() => {
  //   authorize(
  //     TopLevelRoute.ApproveConnection,
  //     "A password is required to approve a connection!",
  //     unlockKeyRing
  //   );
  // }, []);
  const params = useSanitizedParams();
  const { chainId } = params;

  return (
    <ApprovalContainer>
      <p>Approve connection for chain {chainId}?</p>
      <ButtonContainer>
        <Button variant={ButtonVariant.Contained}>Approve</Button>
        <Button variant={ButtonVariant.Contained}>Reject</Button>
      </ButtonContainer>
    </ApprovalContainer>
  );
};
