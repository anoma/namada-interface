import { useEffect, useState } from "react";
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
};

export const ApproveConnection: React.FC<Props> = ({ requester }) => {
  const [isLocked, setIsLocked] = useState(true);
  const authorize = useAuth(requester);

  useEffect(() => {
    authorize(
      TopLevelRoute.ApproveConnection,
      "A password is required to approve a connection!",
      () => setIsLocked(false)
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
