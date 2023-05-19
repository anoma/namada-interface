import React from "react";
import { useNavigate } from "react-router-dom";

import { Button, ButtonVariant } from "@anoma/components";
import { formatRouterPath } from "@anoma/utils";

import {
  BodyText,
  Header1,
  SubViewContainer,
  UpperContentContainer,
} from "Setup/Setup.components";
import { AccountCreationRoute, TopLevelRoute } from "../types";
import { StartViewContainer } from "./Start.components";

const Start: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SubViewContainer>
      <StartViewContainer>
        <UpperContentContainer>
          <Header1>Create Your Account</Header1>
          <BodyText>
            Create an account for your wallet, or connect to Ledger.
          </BodyText>
        </UpperContentContainer>
        <Button
          onClick={() =>
            navigate(
              formatRouterPath([
                TopLevelRoute.AccountCreation,
                AccountCreationRoute.SeedPhrase,
              ])
            )
          }
          variant={ButtonVariant.Contained}
        >
          Create an account
        </Button>
        <Button
          onClick={() => navigate(TopLevelRoute.ImportAccount)}
          variant={ButtonVariant.Contained}
        >
          Import an account
        </Button>
        <Button
          onClick={() => navigate(TopLevelRoute.Ledger)}
          variant={ButtonVariant.Contained}
        >
          Connect to Ledger
        </Button>
      </StartViewContainer>
    </SubViewContainer>
  );
};

export default Start;
