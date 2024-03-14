import { ActionButton } from "@namada/components";
import { useUntilIntegrationAttached } from "@namada/integrations";
import { Chain } from "@namada/types";
import { ConnectStatus, useExtensionConnect } from "hooks/useExtensionConnect";

type Props = {
  chain: Chain;
};

export const ConnectExtensionButton = ({ chain }: Props): JSX.Element => {
  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const { connect, connectionStatus } = useExtensionConnect(chain);

  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const hasExtensionInstalled =
    currentExtensionAttachStatus === "attached" ||
    currentExtensionAttachStatus === "pending";

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {hasExtensionInstalled &&
        connectionStatus !== ConnectStatus.CONNECTED && (
          <ActionButton
            color="primary"
            size="sm"
            borderRadius="sm"
            onClick={connect}
          >
            Connect Extension
          </ActionButton>
        )}

      {!hasExtensionInstalled && (
        <ActionButton
          onClick={() => handleDownloadExtension(chain.extension.url)}
          color="primary"
          size="sm"
          borderRadius="sm"
        >
          Download Extension
        </ActionButton>
      )}
    </>
  );
};
