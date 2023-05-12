import React from "react";
import { useNavigate } from "react-router-dom";

import { Button, ButtonVariant } from "@anoma/components";

import {
  StartViewContainer,
  StartViewUpperPartContainer,
  Header1,
  BodyText,
} from "./Start.components";
import { TopLevelRoute } from "../types";

const Start: React.FC = () => {
  const navigate = useNavigate();

  return (
    <StartViewContainer>
      <StartViewUpperPartContainer>
        <Header1>Create Your Account</Header1>
        <BodyText>
          Create an account for your wallet, or connect to Ledger.
        </BodyText>
      </StartViewUpperPartContainer>
      <Button
        onClick={() => navigate(TopLevelRoute.AccountCreation)}
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
  );
};

export default Start;
