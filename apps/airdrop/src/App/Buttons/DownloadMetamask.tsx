import { ActionButton } from "@namada/components";
import { ModalButtonContainer, ModalButtonText } from "App/App.components";
import { ButtonProps } from "./types";
import { DownloadIcon } from "App/Icons/DownloadIcon";
import { handleExtensionDownload } from "App/utils";

export const DownloadMetamask = ({ disabled }: ButtonProps): JSX.Element => {
  return (
    <ModalButtonContainer>
      <ActionButton
        outlined
        disabled={disabled}
        variant="primary"
        style={{ paddingLeft: "40px", paddingRight: "40px" }}
        icon={<DownloadIcon />}
        onClick={() => handleExtensionDownload("https://metamask.io/download/")}
      >
        Download Metamask to check eligibility with Ethereum Wallet
      </ActionButton>
      <ModalButtonText disabled={!!disabled} themeColor="primary" fontSize="xs">
        NOTE: Make sure to restart website after installing Metamask extension
      </ModalButtonText>
    </ModalButtonContainer>
  );
};
