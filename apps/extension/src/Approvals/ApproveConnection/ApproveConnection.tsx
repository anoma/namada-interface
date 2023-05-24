import { Button, ButtonVariant } from "@anoma/components";
// TODO: Figure out why this isn't working in this context:
// import { useSanitizedParams } from "@anoma/hooks";

import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";

export const ApproveConnection: React.FC = () => {
  // TODO: Query current parent account
  // const authorize = useAuth(requester);
  //
  // useEffect(() => {
  //   authorize(
  //     TopLevelRoute.ApproveConnection,
  //     "A password is required to approve a connection!",
  //     unlockKeyRing
  //   );
  // }, []);

  // TODO: Re-enable once empty params issue is fixed:
  // const params = useSanitizedParams();
  // const { chainId } = params;

  // TODO: Temporary workaround for empty params from useParams & useSanitizedParams hooks
  const { href } = window.location;
  const params = href
    .split("?")[1]
    .split("&")
    .reduce((acc: Record<string, string>, paramValue: string) => {
      const [param, value] = paramValue.split("=");
      acc[param] = value;
      return acc;
    }, {});
  const { chainId } = params;

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
