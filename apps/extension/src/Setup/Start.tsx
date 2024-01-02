import React from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Heading, Image, Stack } from "@namada/components";
import routes from "./routes";

export const Start: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="max-w-[244px] mt-7 mx-auto mb-15">
        <Image imageName="LogoMinimal" />
      </div>
      <Heading
        className="text-white text-center uppercase text-lg font-medium mb-8"
        level="h1"
      >
        Your Keys to Multichain Privacy
      </Heading>
      <Stack as="div" direction="vertical" gap={4}>
        <ActionButton
          size="lg"
          data-testid="setup-create-keys-button"
          onClick={() => navigate(routes.accountCreationWarning())}
        >
          Create new keys
        </ActionButton>
        <ActionButton
          size="lg"
          data-testid="setup-import-keys-button"
          onClick={() => navigate(routes.accountImportSeed())}
        >
          Import existing keys
        </ActionButton>
        <ActionButton
          size="lg"
          onClick={() => navigate(routes.ledgerConnect())}
        >
          Connect to Ledger Hardware Wallet
        </ActionButton>
      </Stack>
    </>
  );
};
