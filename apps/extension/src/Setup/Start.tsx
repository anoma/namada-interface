import clsx from "clsx";
import React from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Heading, Image, Stack } from "@namada/components";
import routes from "./routes";

export const Start: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="max-w-[230px] mt-0 mx-auto mb-9">
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
          size="md"
          data-testid="setup-create-keys-button"
          onClick={() => navigate(routes.accountCreationWarning())}
        >
          Create new keys
        </ActionButton>
        <ActionButton
          size="md"
          data-testid="setup-import-keys-button"
          onClick={() => navigate(routes.accountImportSeed())}
        >
          Import existing keys
        </ActionButton>
        <ActionButton
          size="md"
          onClick={() => navigate(routes.ledgerConnect())}
        >
          Connect to Ledger Hardware Wallet
        </ActionButton>
      </Stack>
    </>
  );
};
