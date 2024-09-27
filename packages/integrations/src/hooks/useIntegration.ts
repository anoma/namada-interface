import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { chains } from "@namada/chains";
import { useUntil } from "@namada/hooks";
import { Keplr, Metamask, Namada } from "@namada/integrations";
import { ChainKey, ExtensionKey } from "@namada/types";

type ExtensionConnection<T, U> = (
  onSuccess: () => T,
  onFail?: () => U,
  chainId?: string
) => Promise<void>;

type IntegrationFromExtensionKey<K extends ExtensionKey> =
  K extends "namada" ? Namada
  : K extends "keplr" ? Keplr
  : K extends "metamask" ? Metamask
  : never;

type IntegrationFromChainKey<K extends ChainKey> = IntegrationFromExtensionKey<
  (typeof chains)[K]["extension"]["id"]
>;

type Integrations = {
  [K in ChainKey]: IntegrationFromChainKey<K>;
};

export const integrations: Integrations = {
  namada: new Namada(chains.namada),
  cosmos: new Keplr(chains.cosmos),
  ethereum: new Metamask(chains.ethereum),
};

export const IntegrationsContext = createContext<Integrations>(integrations);

/**
 * Hook for accessing integration by ChainIndex.
 *
 * @param {ChainIndex} chainKey - Index of chain integration
 * @returns {InstanceType<Integration>} Integration API
 */
export const useIntegration = <K extends ChainKey>(
  chainKey: K
): IntegrationFromChainKey<K> => {
  return useContext(IntegrationsContext)[chainKey];
};

/**
 * Hook for running functions with integration connection.
 *
 * @template TSuccess - Success return type.
 * @template TFail - Fail return type.
 * @param {ChainKey} chainKey - Index of a chain integration
 * @returns {[InstanceType<Integration>, boolean, ExtensionConnection<TSuccess, TFail>]}
 * Tuple of integration, connection status and connection function.
 */
export const useIntegrationConnection = <TSuccess, TFail, K extends ChainKey>(
  chainKey: K,
  chainId?: string
): [
    IntegrationFromChainKey<K>,
    boolean,
    ExtensionConnection<TSuccess, TFail>,
  ] => {
  const integration = useIntegration(chainKey);
  const [isConnectingToExtension, setIsConnectingToExtension] = useState(false);

  const connect: ExtensionConnection<TSuccess, TFail> = useCallback(
    async (onSuccess, onFail, chainId) => {
      setIsConnectingToExtension(true);
      try {
        if (integration.detect()) {
          await integration.connect(chainId);
          await onSuccess();
        }
      } catch {
        if (onFail) {
          await onFail();
        }
      }
      setIsConnectingToExtension(false);
    },
    [chainKey, chainId]
  );

  return [integration, isConnectingToExtension, connect];
};

type AttachStatus = "pending" | "attached" | "detached";
type AttachStatusMap = { [key in ExtensionKey]: AttachStatus };

/**
 * Hook used for returning attach status of extension
 */
export const useUntilIntegrationAttached = (
  chainId: ChainKey = "namada",
  extensionId: ExtensionKey = "namada"
): AttachStatus => {
  const integration = useIntegration(chainId);
  const [attachStatusMap, setAttachStatus] = useState<AttachStatusMap>({
    namada: "pending",
    keplr: "pending",
    metamask: "pending",
  });

  useEffect(() => {
    setAttachStatus((v) => ({ ...v, [extensionId]: "pending" }));
  }, [chainId]);

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

/**
 * Returns integration by chainId. To be used outside react components.
 *
 * @param {Chainkey} chainKey - Key of the chain
 * @returns {InstanceType<Integration>} Integration API
 */
export const getIntegration = <K extends ChainKey>(
  chainKey: K
): IntegrationFromChainKey<K> => {
  return integrations[chainKey];
};
