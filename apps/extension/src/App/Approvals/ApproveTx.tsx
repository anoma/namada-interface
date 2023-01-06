import { useEffect, useState } from "react";
import { Button, ButtonVariant } from "@anoma/components";
import { shortenAddress } from "@anoma/utils";
import { useAuth } from "hooks";
import { TopLevelRoute } from "App/types";
import { ApproveTxContainer } from "./ApproveTx.components";
import { ApprovalButtonContainer } from "./ApproveConnection.components";
import { Address } from "App/Accounts/AccountListing.components";
import { ExtensionRequester } from "extension";

type Props = {
  requester: ExtensionRequester;
};

export const ApproveTx: React.FC<Props> = ({ requester }) => {
  const [isLocked, setIsLocked] = useState(true);
  const authorize = useAuth(requester);

  useEffect(() => {
    authorize(
      TopLevelRoute.ApproveTx,
      "A password is required to approve a transaction!",
      () => setIsLocked(false)
    );
  }, []);

  // TODO: How to load tx details into this view?
  return (
    <ApproveTxContainer>
      {!isLocked && (
        <>
          <p>Approve this Transaction?</p>
          <p>
            Target: <Address>{shortenAddress("xxxxxxxxxxxx")}</Address>
          </p>
          <p>
            Source: <Address>{shortenAddress("xxxxxxxxxxxx")}</Address>
          </p>
          <p>Ammount: 1000</p>
          <p>Token: NAM</p>

          <ApprovalButtonContainer>
            <Button variant={ButtonVariant.Contained}>Approve</Button>
            <Button variant={ButtonVariant.Contained}>Reject</Button>
          </ApprovalButtonContainer>
        </>
      )}
    </ApproveTxContainer>
  );
};
