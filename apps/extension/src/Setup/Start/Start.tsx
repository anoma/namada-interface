import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Heading,
  Image,
  ImageName,
  Stack,
} from "@namada/components";
import { formatRouterPath } from "@namada/utils";

import {
  AccountCreationRoute,
  AccountImportRoute,
  LedgerConnectRoute,
  TopLevelRoute,
} from "../types";

import { HeaderContainer, LogoContainer } from "./Start.components";

const Start: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <LogoContainer>
        <Image imageName={ImageName.LogoMinimal} />
      </LogoContainer>

      <HeaderContainer>
        <Heading size="xl" level="h1">
          Your Keys to Multichain Privacy
        </Heading>
      </HeaderContainer>

      <Stack as="div" direction="vertical" gap={4}>
        <ActionButton
          onClick={() =>
            navigate(
              formatRouterPath([
                TopLevelRoute.AccountCreation,
                AccountCreationRoute.SeedPhraseWarning,
              ])
            )
          }
        >
          Create new keys
        </ActionButton>

        <ActionButton
          onClick={() =>
            navigate(
              formatRouterPath([
                TopLevelRoute.ImportAccount,
                AccountImportRoute.SeedPhrase,
              ])
            )
          }
        >
          Import existing keys
        </ActionButton>

        <ActionButton
          onClick={() =>
            navigate(
              formatRouterPath([
                TopLevelRoute.Ledger,
                LedgerConnectRoute.Connect,
              ])
            )
          }
        >
          Connect to Ledger Hardware Wallet
        </ActionButton>
      </Stack>
    </>
  );
};

export default Start;
