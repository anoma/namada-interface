import { Chain } from "@namada/types";
import { ConnectExtensionButton } from "../ConnectExtensionButton/ConnectExtensionButton";

type Props = {
  isExtensionConnected: boolean;
  chain: Chain;
};

export const TopNavigation = ({
  isExtensionConnected,
  chain,
}: Props): JSX.Element => {
  return (
    <>
      {!isExtensionConnected && (
        <span>
          <ConnectExtensionButton chain={chain} />
        </span>
      )}
    </>
  );
};
