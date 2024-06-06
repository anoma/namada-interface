import { useIntegrationConnection } from "@namada/integrations";
import { Chain } from "@namada/types";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { accountsAtom } from "slices/accounts";
import { namadaExtensionConnectedAtom } from "slices/settings";

export enum ConnectStatus {
  IDLE,
  CONNECTING,
  CONNECTED,
  ERROR,
}

type UseConnectOutput = {
  connectionStatus: ConnectStatus;
  connect: () => Promise<void>;
};

export const useExtensionConnect = (chain: Chain): UseConnectOutput => {
  const {
    refetch: fetchAccounts,
    isError: accountFetchError,
    isSuccess: accountErrorSuccess,
  } = useAtomValue(accountsAtom);

  const [extensionConnected, setExtensionConnected] = useAtom(
    namadaExtensionConnectedAtom
  );

  const [connectionStatus, setConnectionStatus] = useState<ConnectStatus>(
    extensionConnected ? ConnectStatus.CONNECTED : ConnectStatus.IDLE
  );

  const [isConnectingToExtension] = useIntegrationConnection(chain.id);

  useEffect(() => {
    if (isConnectingToExtension) {
      setConnectionStatus(ConnectStatus.CONNECTING);
    }
  }, [isConnectingToExtension]);

  useEffect(() => {
    if (extensionConnected) {
      setConnectionStatus(ConnectStatus.CONNECTED);
    }
  }, [extensionConnected]);

  useEffect(() => {
    setConnectionStatus(ConnectStatus.CONNECTED);
    setExtensionConnected(true);
  }, [accountErrorSuccess]);

  useEffect(() => {
    setConnectionStatus(ConnectStatus.ERROR);
    setExtensionConnected(false);
  }, [accountFetchError]);

  const handleConnectExtension = async (): Promise<void> => {
    if (!extensionConnected) return;
    fetchAccounts();
  };

  return {
    connect: handleConnectExtension,
    connectionStatus,
  };
};
