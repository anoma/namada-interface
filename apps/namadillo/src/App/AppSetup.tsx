import { useUntilIntegrationAttached } from "@namada/integrations";
import { useAtomValue } from "jotai";
import { chainAtom } from "slices/chain";
import { indexerUrlAtom } from "slices/settings";

import React from "react";

type AppSetupProps = {
  children: React.ReactNode;
};

export const AppSetup = ({ children }: AppSetupProps): JSX.Element => {
  const indexerUrl = useAtomValue(indexerUrlAtom);
  const chain = useAtomValue(chainAtom);
  const extensionAttachStatus = useUntilIntegrationAttached();
  const extensionReady = extensionAttachStatus !== "pending";

  // Displays setup screen if the indexer is not defined
  if (!indexerUrl) {
    return <>Indexer is not defined!</>;
  }

  // Loading screen
  if (!extensionReady || chain.isLoading) {
    return <>Loading</>;
  }

  // Handles indexer / connection errors
  if (chain.isError) {
    return <>Error connecting to chain</>;
  }

  // Error if for some reason the RPC url is missing
  if (!chain.data!.rpcUrl) {
    return <>RPC Url not configured</>;
  }

  return <>{children}</>;
};
