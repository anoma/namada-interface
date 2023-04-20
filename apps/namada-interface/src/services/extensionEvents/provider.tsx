import { createContext, useEffect, useState } from "react";

import { Events } from "@anoma/types";
import { defaultChainId } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";

import { useEventListenerOnce } from "hooks";
import { useAppDispatch } from "store";
import { AnomaAccountChangedHandler } from "./handlers/anoma";
import { useIntegration } from "services/integrations";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const anomaIntegration = useIntegration(defaultChainId);

  // Instantiate handlers:
  const anomaAccountChangedHandler = AnomaAccountChangedHandler(
    dispatch,
    anomaIntegration as Anoma
  );

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, anomaAccountChangedHandler);

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
