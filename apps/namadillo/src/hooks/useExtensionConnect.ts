import { useIntegrationConnection } from "@namada/integrations";
import { ExtensionKey } from "@namada/types";
import { ConnectStatus, namadaExtensionConnectionStatus } from "atoms/settings";
import { useAtom } from "jotai";
import { useEffect } from "react";

type UseConnectOutput = {
  connectionStatus: ConnectStatus;
  isConnected: boolean;
  connect: () => Promise<void>;
};

export const useExtensionConnect = (
  chainKey: ExtensionKey = "namada"
): UseConnectOutput => {
  const [connectionStatus, setConnectionStatus] = useAtom(
    namadaExtensionConnectionStatus
  );

  const [_integration, isConnectingToExtension, withConnection] =
    useIntegrationConnection(chainKey);

  useEffect(() => {
    if (isConnectingToExtension) {
      setConnectionStatus("connecting");
    }
  }, [isConnectingToExtension]);

  const handleConnectExtension = async (): Promise<void> => {
    if (connectionStatus === "connected") return;
    withConnection(
      () => setConnectionStatus("connected"),
      () => setConnectionStatus("error")
    );
  };

  return {
    connect: handleConnectExtension,
    isConnected: connectionStatus === "connected",
    connectionStatus,
  };
};
