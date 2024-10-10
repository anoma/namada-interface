import { chains } from "@namada/chains";
import { ExtensionKey } from "@namada/types";
import Keplr from "./Keplr";
import Metamask from "./Metamask";
import Namada from "./Namada";

export type IntegrationFromExtensionKey<K extends ExtensionKey> =
  K extends "namada" ? Namada
  : K extends "keplr" ? Keplr
  : K extends "metamask" ? Metamask
  : never;

export type Integrations = {
  [K in ExtensionKey]: IntegrationFromExtensionKey<K>;
};

export const integrations: Integrations = {
  namada: new Namada(chains.namada),
  keplr: new Keplr(chains.cosmos),
  metamask: new Metamask(chains.ethereum),
};

/**
 * Returns integration by chainId. To be used outside react components.
 *
 * @param {ExtensionKey} extensionKey - Key of the wallet
 * @returns {InstanceType<Integration>} Integration API
 */
export const getIntegration = <K extends ExtensionKey>(
  extensionKey: K
): IntegrationFromExtensionKey<K> => {
  return integrations[extensionKey];
};
