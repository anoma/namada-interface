import { createContext, useEffect, useState } from "react";

import { Anoma, Keplr, Metamask } from "@anoma/integrations";
import { chains } from "@anoma/chains";

import { useEventListenerOnce } from "hooks";
import { useAppDispatch, useAppSelector } from "store";
import { SettingsState } from "slices/settings";
import { AnomaAccountChangedHandler } from "./handlers/anoma";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  // Only respond to events if chain is connected via extension
  const { connectedChains } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const [integrations, setIntegrations] = useState<
    Record<string, Anoma | Keplr | Metamask>
  >({});

  // Instantiate integrations for responding appropriately to events
  useEffect(() => {
    const integrations = Object.keys(chains).reduce(
      (acc: Record<string, Anoma | Keplr | Metamask>, chainId: string) => {
        const chain = chains[chainId];

        switch (chain.extension.id) {
          case "anoma":
            return {
              ...acc,
              [chainId]: new Anoma(chain),
            };
          case "keplr":
            return {
              ...acc,
              [chainId]: new Keplr(chain),
            };
          case "metamask":
            return {
              ...acc,
              [chainId]: new Metamask(chain),
            };
          default:
            return acc;
        }
      },
      {}
    );
    setIntegrations(integrations);
  }, connectedChains);

  // Instantiate handlers:
  const anomaAccountChangedHandler = AnomaAccountChangedHandler(
    dispatch,
    integrations as Record<string, Anoma>,
    connectedChains
  );

  // Register handlers:
  useEventListenerOnce("anoma_account_changed", anomaAccountChangedHandler);

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
