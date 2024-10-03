import { ActionButton } from "@namada/components";
import { namadaExtensionAttachStatus } from "atoms/settings";
import { useExtensionConnect } from "hooks/useExtensionConnect";
import { useAtomValue } from "jotai";

export const ConnectExtensionButton = (): JSX.Element => {
  const extensionAttachStatus = useAtomValue(namadaExtensionAttachStatus);
  const { connect, isConnected } = useExtensionConnect();

  // TODO create an action button when the extension is connected
  // but the account is missing, like on ConnectPanel and ConnectBanner

  return (
    <>
      {extensionAttachStatus === "attached" && !isConnected && (
        <ActionButton backgroundColor="yellow" size="sm" onClick={connect}>
          Connect Keychain
        </ActionButton>
      )}
      {extensionAttachStatus === "detached" && (
        <ActionButton
          href="https://namada.net/extension"
          target="_blank"
          rel="nofollow noreferrer"
          backgroundColor="yellow"
          size="sm"
        >
          Download Keychain
        </ActionButton>
      )}
    </>
  );
};
