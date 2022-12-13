import { chains } from "@anoma/chains";
import { Anoma, Keplr } from "@anoma/integrations";
import { createContext, useContext } from "react";

type Integration = typeof Anoma | typeof Keplr;
type ChainId = string;
type IntegrationsMap = Record<string, Integration>;
type Integrations = Record<ChainId, InstanceType<Integration>>;

const extensionMap: IntegrationsMap = {
  anoma: Anoma,
  keplr: Keplr,
};

const integrations = Object.entries(chains).reduce((acc, [chainId, chain]) => {
  const extensionId = chain.extension.id;

  if (Object.keys(extensionMap).includes(extensionId)) {
    const Ext = extensionMap[extensionId];
    acc[chainId] = new Ext(chain);
  }

  return acc;
}, {} as Integrations);

export const IntegrationsContext = createContext<Integrations>({});

export const IntegrationsProvider: React.FC = (props): JSX.Element => {
  return (
    <IntegrationsContext.Provider value={integrations}>
      {props.children}
    </IntegrationsContext.Provider>
  );
};

export const useIntegrations = (): Integrations => {
  return useContext(IntegrationsContext);
};

/**
 * [Returns integrations map. To be used outside react components.]
 *
 * @returns {[Integrations]} [Map of chainId -> Integration.]
 */
export const getIntegrations = (): Integrations => {
  return integrations;
};

/**
 * [Returns integration by chainId.]
 *
 * @param {ChainId} chainId - [Id of the chain as a string. To be used outside react components.]
 * @returns {InstanceType<Integration>} [Integration API]
 */
export const getIntegration = (chainId: ChainId): InstanceType<Integration> => {
  return integrations[chainId];
};
