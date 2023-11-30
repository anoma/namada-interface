import { ActionButton } from "@namada/components";
import { ButtonProps } from "./types";
import { useKeplrHandler } from "App/hooks";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { OsmosisIcon } from "App/Icons/OsmosisIcon";

export const OsmosisButton = ({ disabled }: ButtonProps): JSX.Element => {
  const keplr = (window as KeplrWindow)?.keplr;
  const osmosisHandler = useKeplrHandler("osmosis-1", "osmosis", keplr);

  return (
    <ActionButton
      outlined
      disabled={disabled}
      variant="primary"
      onClick={osmosisHandler}
      icon={<OsmosisIcon />}
    >
      Osmosis Wallet
    </ActionButton>
  );
};
