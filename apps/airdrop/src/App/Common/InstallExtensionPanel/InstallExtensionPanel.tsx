import { ActionButton } from "@namada/components";
import {
  InstallExtensionContainer,
  InstallExtensionContent,
  InstallExtensionContentWrapper,
  InstallExtensionTitle,
} from "./InstallExtensionPanel.components";
import { handleExtensionDownload } from "App/utils";

type InstallExtensionPanelProps = {
  children: React.ReactNode;
  size?: "large" | "small";
};

export const InstallExtensionPanel = ({
  size = "small",
  children,
}: InstallExtensionPanelProps): JSX.Element => {
  return (
    <InstallExtensionContainer size={size}>
      <InstallExtensionTitle>
        Don&apos;t have a Namada address yet?
      </InstallExtensionTitle>
      <InstallExtensionContentWrapper>
        <InstallExtensionContent>{children}</InstallExtensionContent>
        <ActionButton
          size="sm"
          borderRadius="sm"
          variant="utility1"
          hoverColor="secondary"
          onClick={() =>
            handleExtensionDownload("https://namada.net/extension")
          }
        >
          Install Extension
        </ActionButton>
      </InstallExtensionContentWrapper>
    </InstallExtensionContainer>
  );
};
