import { Window as KeplrWindow } from "@keplr-wallet/types";
import { ActionButton } from "@namada/components";
import { ButtonProps } from "./types";
import { useKeplrHandler } from "App/hooks";
import { StargazerIcon } from "App/Icons/StargazerIcon";

export const StargazerButton = ({ disabled }: ButtonProps): JSX.Element => {
  const keplr = (window as KeplrWindow)?.keplr;
  const stargazeHandler = useKeplrHandler("stargaze-1", "badkids", keplr);

  return (
    <ActionButton
      outlined
      disabled={disabled}
      variant="primary"
      onClick={stargazeHandler}
      icon={<StargazerIcon />}
    >
      Stargaze Wallet
    </ActionButton>
  );
};
