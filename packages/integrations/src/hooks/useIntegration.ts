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
import { Chain, ChainKey, ExtensionKey } from "@namada/types";

type Integration = typeof Namada | typeof Keplr | typeof Metamask;
type ChainId = string;
type IntegrationsMap = Record<ExtensionKey, Integration>;
export type Integrations = Record<ChainId, InstanceType<Integration>>;
type ExtensionConnection<T, U> = (
  onSuccess: () => T,
  onFail?: () => U
) => Promise<void>;

const extensionMap: IntegrationsMap = {
  namada: Namada,
  keplr: Keplr,
  metamask: Metamask,
};

export const integrations = Object.entries(chains).reduce(
  (acc, [chainKey, chain]) => {
    const extensionId = chain.extension.id;

    if (Object.keys(extensionMap).includes(extensionId)) {
      const Ext = extensionMap[extensionId];
      acc[chainKey] = new Ext(chain);
    }

    return acc;
  },
  {} as Integrations
);

export const IntegrationsContext = createContext<Integrations>({});

/**
 * Hook for accessing integration by ChainIndex.
 *
 * @param {ChainIndex} chainKey - Index of chain integration
 * @returns {InstanceType<Integration>} Integration API
 */
export const useIntegration = (
  chainKey: ChainKey
): InstanceType<Integration> => {
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
export const useIntegrationConnection = <TSuccess, TFail>(
  chainKey: ChainKey
): [
    InstanceType<Integration>,
    boolean,
    ExtensionConnection<TSuccess, TFail>,
  ] => {
  const integration = useIntegration(chainKey);
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
    [chainKey]
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
export const useUntilIntegrationAttached = (chain: Chain): AttachStatusMap => {
  const { id, extension } = chain;
  const integration = useIntegration(id);

  const [attachStatusMap, setAttachStatus] = useState<AttachStatusMap>({
    namada: "pending",
    keplr: "pending",
    metamask: "pending",
  });

  useEffect(() => {
    setAttachStatus((v) => ({ ...v, [extension.id]: "pending" }));
  }, [id]);

  useUntil(
    {
      predFn: () => Promise.resolve(integration.detect()),
      onSuccess: () => {
        setAttachStatus((v) => ({ ...v, [extension.id]: "attached" }));
      },
      onFail: () =>
        setAttachStatus((v) => ({ ...v, [extension.id]: "detached" })),
    },
    {
      tries: 10,
      ms: 100,
    },
    [integration]
  );

  return attachStatusMap;
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
export const getIntegration = (
  chainKey: ChainKey
): InstanceType<Integration> => {
  return integrations[chainKey];
};
