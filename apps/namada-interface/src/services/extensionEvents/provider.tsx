import { createContext } from "react";

import { Events } from "@anoma/types";

import { useEventListenerOnce } from "hooks";
import { useAppDispatch } from "store";
import { AnomaAccountChangedHandler } from "./handlers/anoma";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();

  // Instantiate handlers:
  const anomaAccountChangedHandler = AnomaAccountChangedHandler(dispatch);

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, anomaAccountChangedHandler);

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
