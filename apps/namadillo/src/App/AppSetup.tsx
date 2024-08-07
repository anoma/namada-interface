import { useUntilIntegrationAttached } from "@namada/integrations";
import { chainAtomWithRefetch } from "atoms/chain";
import {
  defaultServerConfigAtom,
  indexerHeartbeatAtom,
  indexerUrlAtom,
} from "atoms/settings";
import { useAtomValue } from "jotai";
import { ReactNode, useState } from "react";
import { AtomErrorBoundary } from "./Common/AtomErrorBoundary";
import { ErrorBox } from "./Common/ErrorBox";
import { PageLoader } from "./Common/PageLoader";
import { Setup } from "./Common/Setup";

type AppSetupProps = {
  children: ReactNode;
};

export const AppSetup = ({ children }: AppSetupProps): JSX.Element => {
  const indexerUrl = useAtomValue(indexerUrlAtom);
  const indexerHeartbeat = useAtomValue(indexerHeartbeatAtom);
  const tomlConfig = useAtomValue(defaultServerConfigAtom);
  const chain = useAtomValue(chainAtomWithRefetch);
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
            <p>
              Unable to connect to indexer. Please check your internet
              connection.
            </p>
            <p className="mt-1">
              If the problem persists, you can{" "}
              <button
                className="text-yellow hover:text-cyan"
                onClick={() => setChangeIndexerSettings(true)}
              >
                update your indexer settings.
              </button>
            </p>
          </>
        }
      />
    );
  }

  // Waiting for the extension to be detected along with other chain settings.
  if (!extensionReady || chain.isPending) {
    return <PageLoader />;
  }

  // Look for syntax errors in toml config file
  if (tomlConfig.isError && tomlConfig.error.name === "SyntaxError") {
    return (
      <AtomErrorBoundary
        containerProps={errorContainerProps}
        result={tomlConfig}
        niceError={
          <>
            <p>You have a syntax error in your /config.toml file</p>
            {tomlConfig.error.message && (
              <p className="mt-2 text-xs text-neutral-500">
                Error: {tomlConfig.error.message}
              </p>
            )}
          </>
        }
      />
    );
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
