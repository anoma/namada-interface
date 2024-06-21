import { ActionButton } from "@namada/components";
import { useUntilIntegrationAttached } from "@namada/integrations";
import { useExtensionConnect } from "hooks/useExtensionConnect";
import { useAtomValue } from "jotai";
import { namadaExtensionConnectedAtom } from "slices/settings";

export const ConnectExtensionButton = (): JSX.Element => {
  const extensionAttachStatus = useUntilIntegrationAttached();
  const isExtensionConnected = useAtomValue(namadaExtensionConnectedAtom);
  const { connect } = useExtensionConnect();

  return (
    <>
      {extensionAttachStatus === "attached" && !isExtensionConnected && (
        <ActionButton
          color="primary"
          size="sm"
          borderRadius="sm"
          onClick={connect}
        >
          Connect Extension
        </ActionButton>
      )}
      {extensionAttachStatus === "detached" && (
        <ActionButton
          href="https://namada.net/extension"
          target="_blank"
          rel="nofollow noreferrer"
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
