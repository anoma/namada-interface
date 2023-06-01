import { createContext } from "react";

import { Events } from "@anoma/types";
import { defaultChainId } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";
import { useEventListenerOnce, useIntegration } from "@anoma/hooks";

import { useAppDispatch } from "store";
import {
  AnomaAccountChangedHandler,
  AnomaTransferCompletedHandler,
  AnomaTransferStartedHandler,
  AnomaUpdatedBalancesHandler,
} from "./handlers/anoma";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const anomaIntegration = useIntegration(defaultChainId);

  // Instantiate handlers:
  const anomaAccountChangedHandler = AnomaAccountChangedHandler(
    dispatch,
    anomaIntegration as Anoma
  );
  const anomaTransferStartedHandler = AnomaTransferStartedHandler(dispatch);
  const anomaTransferCompletedHandler = AnomaTransferCompletedHandler(dispatch);

  const anomaUpdatedBalancesHandler = AnomaUpdatedBalancesHandler(dispatch);

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, anomaAccountChangedHandler);
  useEventListenerOnce(Events.TransferStarted, anomaTransferStartedHandler);
  useEventListenerOnce(Events.TransferCompleted, anomaTransferCompletedHandler);
  useEventListenerOnce(Events.UpdatedBalances, anomaUpdatedBalancesHandler);

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
