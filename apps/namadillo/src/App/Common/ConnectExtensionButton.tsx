import { ActionButton } from "@namada/components";
import {
  namadaExtensionAttachStatus,
  namadaExtensionConnectionStatus,
} from "atoms/settings";
import { useNamadaKeychain } from "hooks/useNamadaKeychain";
import { useAtom, useAtomValue } from "jotai";

export const ConnectExtensionButton = (): JSX.Element => {
  const extensionAttachStatus = useAtomValue(namadaExtensionAttachStatus);
  const { connect } = useNamadaKeychain();
  const [connectStatus] = useAtom(namadaExtensionConnectionStatus);

  // TODO create an action button when the extension is connected
  // but the account is missing, like on useConnectText

  return (
    <>
      {extensionAttachStatus === "attached" &&
        connectStatus !== "connected" && (
          <ActionButton
            outlineColor="yellow"
            backgroundColor="yellow"
            backgroundHoverColor="transparent"
            textColor="black"
            textHoverColor="yellow"
            size="sm"
            onClick={connect}
          >
            {connectStatus === "connecting" ?
              "Connecting..."
            : "Connect Keychain"}
          </ActionButton>
        )}
      {extensionAttachStatus === "detached" && (
        <ActionButton
          href="https://namada.net/extension"
          target="_blank"
          rel="noreferrer"
          outlineColor="yellow"
          backgroundColor="yellow"
          backgroundHoverColor="transparent"
          textColor="black"
          textHoverColor="yellow"
          size="sm"
        >
          Download Keychain
        </ActionButton>
      )}
    </>
  );
};
