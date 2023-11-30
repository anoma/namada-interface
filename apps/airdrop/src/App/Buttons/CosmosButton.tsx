import { ActionButton } from "@namada/components";
import { ButtonProps } from "./types";
import { useKeplrHandler } from "App/hooks";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { CosmosIcon } from "App/Icons/CosmosIcon";

export const CosmosButton = ({ disabled }: ButtonProps): JSX.Element => {
  const keplr = (window as KeplrWindow)?.keplr;
  const cosmosHandler = useKeplrHandler("cosmoshub-4", "cosmos", keplr);

  return (
    <ActionButton
      outlined
      disabled={disabled}
      variant="primary"
      onClick={cosmosHandler}
      icon={<CosmosIcon />}
    >
      Cosmos Wallet
    </ActionButton>
  );
};
