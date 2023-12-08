import { ActionButton } from "@namada/components";
import { ButtonProps } from "./types";
import { EthereumIcon } from "App/Icons/EthereumIcon";
import { useMetamaskHandler } from "App/hooks";
import { getMetamask } from "App/utils";

export const MetamaskButton = ({ disabled }: ButtonProps): JSX.Element => {
  const metamask = getMetamask();
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
