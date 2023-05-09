import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { chains } from "@anoma/chains";
import { Anoma, Keplr, Metamask } from "@anoma/integrations";
import { Chain, ExtensionKey } from "@anoma/types";
import { useUntil } from "@anoma/hooks";

type Integration = typeof Anoma | typeof Keplr | typeof Metamask;
type ChainId = string;
type IntegrationsMap = Record<string, Integration>;
export type Integrations = Record<ChainId, InstanceType<Integration>>;
type ExtensionConnection<T, U> = (
  onSuccess: () => T,
  onFail?: () => U
) => Promise<void>;

const extensionMap: IntegrationsMap = {
  anoma: Anoma,
  keplr: Keplr,
  metamask: Metamask,
};

export const integrations = Object.entries(chains).reduce(
  (acc, [chainId, chain]) => {
    const extensionId = chain.extension.id;

    if (Object.keys(extensionMap).includes(extensionId)) {
      const Ext = extensionMap[extensionId];
      acc[chainId] = new Ext(chain);
    }

    return acc;
  },
  {} as Integrations
);

export const IntegrationsContext = createContext<Integrations>({});

/**
 * Hook for accessing integration by ChainId.
 *
 * @param {ChainId} chainId - Id of the chain as a string.
 * @returns {InstanceType<Integration>} Integration API
 */
export const useIntegration = (chainId: ChainId): InstanceType<Integration> => {
  return useContext(IntegrationsContext)[chainId];
};

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
  chainId: string
): [
  InstanceType<Integration>,
  boolean,
  ExtensionConnection<TSuccess, TFail>
] => {
  const integration = useIntegration(chainId);
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
    [chainId]
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
  const { chainId, extension } = chain;
  const integration = useIntegration(chainId);

  const [attachStatusMap, setAttachStatus] = useState<AttachStatusMap>({
    anoma: "pending",
    keplr: "pending",
    metamask: "pending",
  });

  useEffect(() => {
    setAttachStatus((v) => ({ ...v, [extension.id]: "pending" }));
  }, [chainId]);

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
 * @returns {[Integrations]} Map of chainId -> Integration.
 */
export const getIntegrations = (): Integrations => {
  return integrations;
};

/**
 * Returns integration by chainId. To be used outside react components.
 *
 * @param {ChainId} chainId - Id of the chain as a string.
 * @returns {InstanceType<Integration>} Integration API
 */
export const getIntegration = (chainId: ChainId): InstanceType<Integration> => {
  return integrations[chainId];
};
