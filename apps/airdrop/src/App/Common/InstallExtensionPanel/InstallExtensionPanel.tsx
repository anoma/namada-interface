import { ActionButton } from "@namada/components";
import {
  InstallExtensionContainer,
  InstallExtensionContent,
  InstallExtensionTitle,
} from "./InstallExtensionPanel.components";

export const InstallExtensionPanel = (): JSX.Element => {
  return (
    <InstallExtensionContainer>
      <InstallExtensionTitle>
        Don&apos;t have Namada address yet?
      </InstallExtensionTitle>
      <InstallExtensionContent>
        Install the Namada Browser extension or use the Namada CLI to create
        your NAM keys to submit for the genesis block proposal
      </InstallExtensionContent>
      <ActionButton size="sm" borderRadius="sm" variant="utility2">
        Install Extension
      </ActionButton>
    </InstallExtensionContainer>
  );
};
