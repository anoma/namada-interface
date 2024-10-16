import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useUntil } from "@namada/hooks";
import { ExtensionKey } from "@namada/types";
import {
  IntegrationFromExtensionKey,
  integrations,
  Integrations,
} from "../utils";

type ExtensionConnection<T, U> = (
  onSuccess: () => T,
  onFail?: () => U
) => Promise<void>;

export const IntegrationsContext = createContext<Integrations>(integrations);

/**
 * Hook for accessing integration by ChainIndex.
 *
 * @param {ChainIndex} chainKey - Index of chain integration
 * @returns {InstanceType<Integration>} Integration API
 */
export const useIntegration = <K extends ExtensionKey>(
  chainKey: K
): IntegrationFromExtensionKey<K> => {
  return useContext(IntegrationsContext)[chainKey];
};

/**
 * Hook for running functions with integration connection.
 *
 * @template TSuccess - Success return type.
 * @template TFail - Fail return type.
 * @param {ExtensionKey} extensionKey - Index of a wallet integration
 * @returns {[InstanceType<Integration>, boolean, ExtensionConnection<TSuccess, TFail>]}
 * Tuple of integration, connection status and connection function.
 */
export const useIntegrationConnection = <
  TSuccess,
  TFail,
  K extends ExtensionKey,
>(
  extensionKey: K
): [
  IntegrationFromExtensionKey<K>,
  boolean,
  ExtensionConnection<TSuccess, TFail>,
] => {
  const integration = useIntegration(extensionKey);
  const [isConnectingToExtension, setIsConnectingToExtension] = useState(false);

  const connect: ExtensionConnection<TSuccess, TFail> = useCallback(
    async (onSuccess, onFail) => {
      setIsConnectingToExtension(true);
      try {
        if (integration.detect()) {
          await integration.connect();
          await onSuccess();
        }
      } catch {
        if (onFail) {
          await onFail();
        }
      }
      setIsConnectingToExtension(false);
    },
    [extensionKey]
  );

  return [integration, isConnectingToExtension, connect];
};

type AttachStatus = "pending" | "attached" | "detached";
type AttachStatusMap = { [key in ExtensionKey]: AttachStatus };

/**
 * Hook used for returning attach status of extension
 */
export const useUntilIntegrationAttached = (
  extensionId: ExtensionKey = "namada"
): AttachStatus => {
  const integration = useIntegration(extensionId);
  const [attachStatusMap, setAttachStatus] = useState<AttachStatusMap>({
    namada: "pending",
    keplr: "pending",
    metamask: "pending",
  });

  useEffect(() => {
    setAttachStatus((v) => ({ ...v, [extensionId]: "pending" }));
  }, [extensionId]);

  useUntil(
    {
      predFn: () => Promise.resolve(integration.detect()),
      onSuccess: () => {
        setAttachStatus((v) => ({ ...v, [extensionId]: "attached" }));
      },
      onFail: () =>
        setAttachStatus((v) => ({ ...v, [extensionId]: "detached" })),
    },
    {
      tries: 10,
      ms: 100,
    },
    [integration]
  );

  return attachStatusMap[extensionId];
};

/**
 * Returns integrations map. To be used outside react components.
 *
 * @returns {[Integrations]} Map of chainKey -> Integration.
 */
export const getIntegrations = (): Integrations => {
  return integrations;
};
