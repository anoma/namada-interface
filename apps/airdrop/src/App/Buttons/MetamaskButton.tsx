import { ActionButton } from "@namada/components";
import { ButtonProps } from "./types";
import { EthereumIcon } from "App/Icons/EthereumIcon";
import { useMetamaskHandler } from "App/hooks";
import { MetamaskWindow } from "App/types";

export const MetamaskButton = ({ disabled }: ButtonProps): JSX.Element => {
  const metamask = (window as MetamaskWindow)?.ethereum;
  const metamaskHandler = useMetamaskHandler("0x1", metamask);

  if (!metamask) return <></>;

  return (
    <ActionButton
      outlined
      disabled={disabled}
      variant="primary"
      onClick={metamaskHandler}
      icon={<EthereumIcon />}
    >
      Ethereum Wallet
    </ActionButton>
  );
};
