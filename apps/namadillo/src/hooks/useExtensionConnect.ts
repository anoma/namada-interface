import { useIntegrationConnection } from "@namada/integrations";
import { Chain } from "@namada/types";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { addAccountsAtom, balancesAtom } from "slices/accounts";
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
  const addAccounts = useSetAtom(addAccountsAtom);
  useAtomValue(balancesAtom);

  const [extensionConnected, setExtensionConnected] = useAtom(
    namadaExtensionConnectedAtom
  );

  const [connectionStatus, setConnectionStatus] = useState<ConnectStatus>(
    extensionConnected ? ConnectStatus.CONNECTED : ConnectStatus.IDLE
  );

  const [integration, isConnectingToExtension, withConnection] =
    useIntegrationConnection(chain.id);

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

  const handleConnectExtension = async (): Promise<void> => {
    if (extensionConnected) return;

    withConnection(
      async () => {
        const accounts = await integration?.accounts();
        if (accounts) {
          addAccounts(accounts);
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
