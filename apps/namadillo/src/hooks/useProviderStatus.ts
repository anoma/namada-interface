import { useUntilIntegrationAttached } from "@namada/integrations";
import { ChainKey, ExtensionKey } from "@namada/types";
import { ConnectStatus, providerStatusAtom } from "atoms/settings";
import { useAtom } from "jotai";
import { useEffect } from "react";

export const useProviderStatus = (
  provider: ExtensionKey,
  chainId: ChainKey = "namada"
): ConnectStatus => {
  const extensionAttachStatus = useUntilIntegrationAttached(chainId, provider);
  const [providerStatus, setProviderStatus] = useAtom(providerStatusAtom);
  const status: ConnectStatus =
    extensionAttachStatus === "pending" ? "connecting"
    : extensionAttachStatus === "detached" ? "idle"
    : "connected";

  useEffect(() => {
    setProviderStatus({
      ...providerStatus,
      [provider]: status,
    });
  }, [extensionAttachStatus]);

  return providerStatus[provider];
};
