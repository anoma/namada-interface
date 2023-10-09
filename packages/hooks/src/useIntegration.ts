import { createContext, useCallback, useEffect, useState } from "react";

import { Namada, Keplr, Metamask, extensions } from "@namada/integrations";
import { ExtensionKey } from "@namada/types";
import { useUntil } from "@namada/hooks";

type Integration = typeof Namada | typeof Keplr | typeof Metamask;
type ChainId = string;
export type Integrations = Record<ChainId, InstanceType<Integration>>;
type ExtensionConnection<T, U> = (
  onSuccess: () => T,
  onFail?: () => U
) => Promise<void>;

export const IntegrationsContext = createContext<Integrations>({});

/**
 * Hook for running functions with integration connection.
 *
 * @template TSuccess - Success return type.
 * @template TFail - Fail return type.
 * @param {string} chainId - Id of a chain
 * @returns {[InstanceType<Integration>, boolean, ExtensionConnection<TSuccess, TFail>]}
 * Tuple of integration, connection status and connection function.
 */
export const useIntegrationConnection = <TSuccess, TFail>(
  extensionName: ExtensionKey
): [
  InstanceType<Integration>,
  boolean,
  ExtensionConnection<TSuccess, TFail>
] => {
  const integration = extensions[extensionName];
  const [isConnectingToExtension, setIsConnectingToExtension] = useState(false);

  const connect: ExtensionConnection<TSuccess, TFail> = useCallback(
    async (onSuccess, onFail) => {
      setIsConnectingToExtension(true);
      try {
        if (integration?.detect()) {
          await integration?.connect();
          await onSuccess();
        }
      } catch (e) {
        if (onFail) {
          await onFail();
        }
      }
      setIsConnectingToExtension(false);
    },
    [extensionName]
  );

  return [integration, isConnectingToExtension, connect];
};

type AttachStatus = "pending" | "attached" | "detached";
type AttachStatusMap = { [key in ExtensionKey]: AttachStatus };

/**
 * Hook used for returning attach status of extension
 *
 * @param {Chain} chain - Current chain configuration
 * @returns {AttachStatusMap} Map of extension -> status
 */
export const useUntilIntegrationAttached = (
  extensionName: ExtensionKey
): AttachStatusMap => {
  const integration = extensions[extensionName];

  const [attachStatusMap, setAttachStatus] = useState<AttachStatusMap>({
    namada: "pending",
    keplr: "pending",
    metamask: "pending",
  });

  useEffect(() => {
    setAttachStatus((v) => ({ ...v, [extensionName]: "pending" }));
  }, [extensionName]);

  useUntil(
    {
      predFn: () => Promise.resolve(integration.detect()),
      onSuccess: () => {
        setAttachStatus((v) => ({ ...v, [extensionName]: "attached" }));
      },
      onFail: () =>
        setAttachStatus((v) => ({ ...v, [extensionName]: "detached" })),
    },
    {
      tries: 10,
      ms: 100,
    },
    [integration]
  );

  return attachStatusMap;
};
