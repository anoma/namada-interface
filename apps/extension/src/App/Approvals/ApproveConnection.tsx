import { useEffect } from "react";
import { Button, ButtonVariant } from "@anoma/components";

import { ExtensionRequester } from "extension";
import {
  ApproveConnectionContainer,
  ApprovalButtonContainer,
} from "./ApproveConnection.components";
import { TopLevelRoute } from "App/types";
import { useAuth } from "hooks";

type Props = {
  requester: ExtensionRequester;
  isLocked: boolean;
  unlockKeyRing: () => void;
};

export const ApproveConnection: React.FC<Props> = ({
  requester,
  isLocked,
  unlockKeyRing,
}) => {
  const authorize = useAuth(requester);

  useEffect(() => {
    authorize(
      TopLevelRoute.ApproveConnection,
      "A password is required to approve a connection!",
      unlockKeyRing
    );
  }, []);

  return (
    <ApproveConnectionContainer>
      {!isLocked && (
        <>
          <p>Approve connection?</p>
          <ApprovalButtonContainer>
            <Button variant={ButtonVariant.Contained}>Approve</Button>
            <Button variant={ButtonVariant.Contained}>Reject</Button>
          </ApprovalButtonContainer>
        </>
      )}
    </ApproveConnectionContainer>
  );
};
