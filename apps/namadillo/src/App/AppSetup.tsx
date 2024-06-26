import { useUntilIntegrationAttached } from "@namada/integrations";
import { useAtomValue } from "jotai";
import React, { useState } from "react";
import { chainAtom } from "slices/chain";
import { chainParametersAtom } from "slices/chainParameters";
import {
  defaultServerConfigAtom,
  indexerHeartbeatAtom,
  indexerUrlAtom,
} from "slices/settings";
import { AtomErrorBoundary } from "./Common/AtomErrorBoundary";
import { ErrorBox } from "./Common/ErrorBox";
import { PageLoader } from "./Common/PageLoader";
import { Setup } from "./Common/Setup";

type AppSetupProps = {
  children: React.ReactNode;
};

export const AppSetup = ({ children }: AppSetupProps): JSX.Element => {
  const indexerUrl = useAtomValue(indexerUrlAtom);
  const indexerHeartbeat = useAtomValue(indexerHeartbeatAtom);
  const tomlConfig = useAtomValue(defaultServerConfigAtom);
  const chain = useAtomValue(chainAtom);
  const chainParameters = useAtomValue(chainParametersAtom);
  const extensionAttachStatus = useUntilIntegrationAttached();
  const extensionReady = extensionAttachStatus !== "pending";
  const errorContainerProps = { className: "text-white h-svh" };
  const [changeIndexerSettings, setChangeIndexerSettings] = useState(false);

  // Before anything else, we need to check if there's a TOML config file in the root and load it.
  if (tomlConfig.isPending) {
    return <PageLoader />;
  }

  // Displays setup screen if the indexer is not defined
  // (AppSetup is outside route context)
  if (!indexerUrl || changeIndexerSettings) {
    return (
      <Setup
        onChange={() => {
          indexerHeartbeat.refetch();
          setChangeIndexerSettings(false);
        }}
      />
    );
  }

  // Prioritizes indexer loading; if it fails, we won't wait for other pending requests.
  if (indexerHeartbeat.isPending) {
    return <PageLoader />;
  }

  // Checks if the indexer details are valid.
  if (indexerHeartbeat.isError) {
    return (
      <AtomErrorBoundary
        result={indexerHeartbeat}
        containerProps={errorContainerProps}
        niceError={
          <>
            Unable to connect to indexer. Please check your internet connection.
            If the problem persists,{" "}
            <button
              className="text-yellow hover:text-cyan"
              onClick={() => setChangeIndexerSettings(true)}
            >
              click here
            </button>
            to verify your indexer settings.
          </>
        }
      />
    );
  }

  // Waiting for the extension to be detected along with other chain settings.
  if (!extensionReady || chainParameters.isLoading || chain.isPending) {
    return <PageLoader />;
  }

  // Handles chain connection errors.
  if (chain.isError) {
    return (
      <AtomErrorBoundary
        containerProps={errorContainerProps}
        result={chain}
        niceError="Unable to load chain info. Please check your internet connection."
      />
    );
  }

  // Error if, for some reason, the RPC URL is missing.
  if (!chain.data!.rpcUrl) {
    return (
      <ErrorBox
        niceError="RPC Url was not provided"
        containerProps={errorContainerProps}
      />
    );
  }

  // Done 🎉
  return <>{children}</>;
};
