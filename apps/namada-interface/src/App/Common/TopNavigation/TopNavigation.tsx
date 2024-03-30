import { ActionButton } from "@namada/components";
import { Chain } from "@namada/types";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import clsx from "clsx";
import { ConnectStatus, useExtensionConnect } from "hooks/useExtensionConnect";

type Props = {
  chain: Chain;
};

export const TopNavigation = ({ chain }: Props): JSX.Element => {
  const { connectionStatus } = useExtensionConnect(chain);

  return (
    <>
      {connectionStatus !== ConnectStatus.CONNECTED && (
        <span>
          <ConnectExtensionButton chain={chain} />
        </span>
      )}

      {connectionStatus === ConnectStatus.CONNECTED && (
        <>
          <div className="grid grid-cols-[140px_140px_140px] items-center gap-4">
            <ActionButton
              hoverColor="black"
              color="white"
              size="xs"
              borderRadius="sm"
            >
              Send
            </ActionButton>
            <ActionButton
              hoverColor="primary"
              color="black"
              size="xs"
              borderRadius="sm"
            >
              Receive
            </ActionButton>
            <ActionButton
              hoverColor="black"
              color="secondary"
              size="xs"
              borderRadius="sm"
            >
              Shield
            </ActionButton>
          </div>
          <div>
            <span
              className={clsx(
                "px-7 py-3.5 flex items-center text-xs text-white bg-black rounded-xs"
              )}
            >
              <i />
              <span>Namada Wallet 01</span>
            </span>
          </div>
        </>
      )}
    </>
  );
};
