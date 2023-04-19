import { createContext } from "react";

import { Anoma } from "@anoma/integrations";

import { useEventListenerOnce } from "hooks";
import { useIntegration } from "services";
import { useAppDispatch, useAppSelector } from "store";
import { SettingsState } from "slices/settings";
import { AnomaAccountChangedHandler } from "./handlers/anoma";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { chainId, connectedChains } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const integration = useIntegration(chainId);
  const isConnected = connectedChains.indexOf(chainId) > -1;

  // Register handlers:
  const accountChangedHandler = AnomaAccountChangedHandler(
    dispatch,
    integration as Anoma,
    isConnected
  );

  useEventListenerOnce("anoma_account_changed", accountChangedHandler);

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
