import { useIntegrationConnection } from "@namada/integrations";
import { Account, Chain } from "@namada/types";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { addAccounts, fetchBalances } from "slices/accounts";
import { namadaExtensionConnectedAtom, setIsConnected } from "slices/settings";
import { useAppDispatch } from "store";

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
  const dispatch = useAppDispatch();
  const [extensionConnected, setExtensionConnected] = useAtom(
    namadaExtensionConnectedAtom
  );

  const [connectionStatus, setConnectionStatus] = useState<ConnectStatus>(
    extensionConnected ? ConnectStatus.CONNECTED : ConnectStatus.IDLE
  );

  const [integration, isConnectingToExtension, withConnection] =
    useIntegrationConnection(chain.id);

  useEffect(() => {
    if (
      isConnectingToExtension &&
      connectionStatus !== ConnectStatus.CONNECTED
    ) {
      setConnectionStatus(ConnectStatus.CONNECTING);
    }
  }, [isConnectingToExtension]);

  const handleConnectExtension = async (): Promise<void> => {
    if (extensionConnected) return;

    withConnection(
      async () => {
        const accounts = await integration?.accounts();
        if (accounts) {
          dispatch(addAccounts(accounts as Account[]));
          dispatch(fetchBalances());
          dispatch(setIsConnected(chain.id));
        }
        setConnectionStatus(ConnectStatus.CONNECTED);
        setExtensionConnected(true);
      },
      async () => {
        setConnectionStatus(ConnectStatus.ERROR);
        setExtensionConnected(false);
      }
    );
  };

  return {
    connect: handleConnectExtension,
    connectionStatus,
  };
};
