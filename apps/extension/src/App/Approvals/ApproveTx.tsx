import { useEffect } from "react";

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
  // An alias of the parent account is provided to inform the user of which account they need to authenticate
  // against, and the password they provide need to match what was entered during setup for that account.
  parentAlias: string;
  isLocked: boolean;
  unlockKeyRing: () => void;
};

export const ApproveTx: React.FC<Props> = ({
  requester,
  parentAlias,
  isLocked,
  unlockKeyRing,
}) => {
  const authorize = useAuth(requester);

  useEffect(() => {
    authorize(
      TopLevelRoute.ApproveTx,
      `A password for "${parentAlias}" is required to approve a transaction!`,
      unlockKeyRing
    );
  }, []);

  // TODO: How to load tx details into this view? Via a query parameter?
  return (
    <ApproveTxContainer>
      {!isLocked && (
        <>
          <p>Approve this Transaction?</p>
          <p>
            Target:&nbsp;
            <Address>
              {shortenAddress(
                "atest1d9khqw368ycrv3phxgcnwdzygdp5xd2yxyey2w2ygdpy23jxxgeyy3zp8ymnw3p5xyuyxwps5u3n2x"
              )}
            </Address>
          </p>
          <p>
            Source:&nbsp;
            <Address>
              {shortenAddress(
                "atest1d9khqw36xu65v3phgs6nvwz98q6rxvfnxaqnwv2rx4rrwsjxgezyvdpk8yervvjzgsu5vd34zrynzd"
              )}
            </Address>
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
