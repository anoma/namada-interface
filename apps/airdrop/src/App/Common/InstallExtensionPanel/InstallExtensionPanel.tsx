import { browserName } from "react-device-detect";
import { ActionButton } from "@namada/components";
import {
  InstallExtensionContainer,
  InstallExtensionContent,
  InstallExtensionContentWrapper,
  InstallExtensionTitle,
} from "./InstallExtensionPanel.components";
import { handleExtensionDownload } from "App/hooks";
import { useCallback } from "react";

type InstallExtensionPanelProps = {
  children: React.ReactNode;
  size?: "large" | "small";
};

export const InstallExtensionPanel = ({
  size = "small",
  children,
}: InstallExtensionPanelProps): JSX.Element => {
  const handleDownload = useCallback(() => {
    const url =
      browserName === "Firefox"
        ? "https://addons.mozilla.org/en-US/firefox/addon/namada-extension/"
        : "https://chrome.google.com/webstore/detail/namada-extension/hnebcbhjpeejiclgbohcijljcnjdofek";

    handleExtensionDownload(url);
  }, []);
  return (
    <InstallExtensionContainer size={size}>
      <InstallExtensionTitle>
        Don&apos;t have Namada address yet?
      </InstallExtensionTitle>
      <InstallExtensionContentWrapper>
        <InstallExtensionContent>{children}</InstallExtensionContent>
        <ActionButton
          size="sm"
          borderRadius="sm"
          variant="utility1"
          hoverColor="secondary"
          onClick={handleDownload}
        >
          Install Extension
        </ActionButton>
      </InstallExtensionContentWrapper>
    </InstallExtensionContainer>
  );
};
