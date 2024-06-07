import { ActionButton } from "@namada/components";
import { useUntilIntegrationAttached } from "@namada/integrations";
import { Chain } from "@namada/types";
import { useExtensionConnect } from "hooks/useExtensionConnect";
import { useAtomValue } from "jotai";
import { namadaExtensionConnectedAtom } from "slices/settings";

type Props = {
  chain: Chain;
};

export const ConnectExtensionButton = ({ chain }: Props): JSX.Element => {
  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const isExtensionConnected = useAtomValue(namadaExtensionConnectedAtom);

  const { connect } = useExtensionConnect(chain);

  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const hasExtensionInstalled =
    currentExtensionAttachStatus === "attached" ||
    currentExtensionAttachStatus === "pending";

  const handleDownloadExtension = (): void => {
    window.open(
      "https://namada.net/extension",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
      {hasExtensionInstalled && !isExtensionConnected && (
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
          onClick={() => handleDownloadExtension()}
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
