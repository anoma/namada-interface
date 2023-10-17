import { Button, ButtonVariant } from "@namada/components";
import {
  useIntegrationConnection,
  useUntilIntegrationAttached,
} from "@namada/hooks";
import { Chain } from "@namada/types";
import { addAccounts, fetchBalances } from "slices/accounts";
import { setIsConnected } from "slices/settings";
import { useAppDispatch } from "store";

type ConnectExtensionButtonProps = {
  chain: Chain;
  text: string;
};

export const ConnectExtensionButton = ({
  chain,
  text,
}: ConnectExtensionButtonProps): JSX.Element => {
  const { chainId, extension } = chain;
  const dispatch = useAppDispatch();
  const [integration, isConnectingToExtension, withConnection] =
    useIntegrationConnection(chain.extension.id);
  const extensionAttachStatus = useUntilIntegrationAttached(chain.extension.id);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const handleConnectExtension = async (): Promise<void> => {
    withConnection(
      async () => {
        const accounts = await integration.accounts();
        if (accounts) {
          dispatch(addAccounts(accounts));
          dispatch(fetchBalances(chainId));
        }
        dispatch(setIsConnected(chainId));
      },
      async () => {
        //TODO: handle error
      }
    );
  };

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      variant={ButtonVariant.Contained}
      onClick={
        currentExtensionAttachStatus === "attached"
          ? handleConnectExtension
          : handleDownloadExtension.bind(null, extension.url)
      }
      loading={
        currentExtensionAttachStatus === "pending" || isConnectingToExtension
      }
      style={
        currentExtensionAttachStatus === "pending"
          ? { color: "transparent" }
          : {}
      }
    >
      {currentExtensionAttachStatus === "attached" ||
      currentExtensionAttachStatus === "pending"
        ? text
        : `Click to download the Keplr extension`}
    </Button>
  );
};
