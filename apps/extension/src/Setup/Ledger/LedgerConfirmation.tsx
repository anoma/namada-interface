import React from "react";

import { ActionButton, Heading, Text, ViewKeys } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { formatRouterPath } from "@namada/utils";
import { HeaderContainer } from "Setup/Setup.components";
import { LedgerConnectRoute, TopLevelRoute } from "Setup/types";
import { useLocation, useNavigate } from "react-router-dom";
import { closeCurrentTab } from "utils";

type LedgerConfirmationStateProps = {
  account: DerivedAccount;
};

export const LedgerConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LedgerConfirmationStateProps;

  if (!locationState || !locationState.account) {
    navigate(
      formatRouterPath([TopLevelRoute.Ledger, LedgerConnectRoute.Connect])
    );
    return null;
  }

  return (
    <>
      <HeaderContainer>
        <Heading level="h1" size="3xl">
          Namada Keys Imported
        </Heading>
        <Text>Here are the accounts generated from your keys</Text>
      </HeaderContainer>
      <ViewKeys
        publicKeyAddress={locationState.account.publicKey}
        transparentAccountAddress={locationState.account.address}
        footer={
          <ActionButton onClick={closeCurrentTab}>Close this page</ActionButton>
        }
      />
    </>
  );
};
