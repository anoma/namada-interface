import clsx from "clsx";
import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Heading,
  Image,
  LinkButton,
  Stack,
} from "@namada/components";
import routes from "./routes";

export const Start: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="pt-10">
      <div className="max-w-[230px] mx-auto mb-9">
        <Image imageName="LogoMinimal" />
      </div>
      <Heading
        className={clsx(
          "text-yellow text-center uppercase text-xl font-medium mb-9 tracking-[0.015em]"
        )}
        level="h1"
      >
        Your Keys to Multichain Privacy
      </Heading>
      <Stack as="div" direction="vertical" gap={2}>
        <ActionButton
          size="lg"
          data-testid="setup-create-keys-button"
          onClick={() => navigate(routes.accountCreationWarning())}
        >
          Create new keys
        </ActionButton>
        <ActionButton
          size="lg"
          outlined
          data-testid="setup-import-keys-button"
          onClick={() => navigate(routes.accountImportSeed())}
        >
          Import existing keys
        </ActionButton>
        <LinkButton
          className="py-3"
          color="white"
          hoverColor="primary"
          onClick={() => navigate(routes.ledgerConnect())}
        >
          Connect Hardware Wallet
        </LinkButton>
      </Stack>
    </div>
  );
};
