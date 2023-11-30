import { ActionButton } from "@namada/components";
import { ModalButtonContainer, ModalButtonText } from "App/App.components";
import { ButtonProps } from "./types";
import { handleExtensionDownload } from "App/hooks";
import { DownloadIcon } from "App/Icons/DownloadIcon";

export const DownloadKeplr = ({ disabled }: ButtonProps): JSX.Element => {
  return (
    <ModalButtonContainer>
      <ActionButton
        outlined
        disabled={disabled}
        variant="primary"
        style={{ paddingLeft: "40px", paddingRight: "40px" }}
        icon={<DownloadIcon />}
        onClick={() =>
          handleExtensionDownload("https://www.keplr.app/download")
        }
      >
        Download Keplr to check eligibility with Cosmos / Osmosis / Stargaze
        wallet
      </ActionButton>
      <ModalButtonText disabled={!!disabled} themeColor="primary" fontSize="xs">
        NOTE: Make sure to restart website after installing Keplr extension
      </ModalButtonText>
    </ModalButtonContainer>
  );
};
