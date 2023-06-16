import { createContext } from "react";

import { Events, KeplrEvents, MetamaskEvents } from "@anoma/types";
import {
  defaultChainId,
  defaultCosmosChainId,
  defaultEthereumChainId,
} from "@anoma/chains";
import { Anoma, Keplr, Metamask } from "@anoma/integrations";
import { useEventListenerOnce, useIntegration } from "@anoma/hooks";

import { useAppDispatch } from "store";
import {
  AnomaAccountChangedHandler,
  AnomaTransferCompletedHandler,
  AnomaTransferStartedHandler,
  AnomaUpdatedBalancesHandler,
  KeplrAccountChangedHandler,
  MetamaskAccountChangedHandler,
} from "./handlers";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const anomaIntegration = useIntegration(defaultChainId);
  const keplrIntegration = useIntegration(defaultCosmosChainId);
  const metamaskIntegration = useIntegration(defaultEthereumChainId);

  // Instantiate handlers:
  const anomaAccountChangedHandler = AnomaAccountChangedHandler(
    dispatch,
    anomaIntegration as Anoma
  );
  const anomaTransferStartedHandler = AnomaTransferStartedHandler(dispatch);
  const anomaTransferCompletedHandler = AnomaTransferCompletedHandler(dispatch);
  const anomaUpdatedBalancesHandler = AnomaUpdatedBalancesHandler(dispatch);

  // Keplr handlers
  const keplrAccountChangedHandler = KeplrAccountChangedHandler(
    dispatch,
    keplrIntegration as Keplr
  );

  // Metamask handlers
  const metamaskAccountChangedHandler = MetamaskAccountChangedHandler(
    dispatch,
    metamaskIntegration as Metamask
  );

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, anomaAccountChangedHandler);
  useEventListenerOnce(Events.TransferStarted, anomaTransferStartedHandler);
  useEventListenerOnce(Events.TransferCompleted, anomaTransferCompletedHandler);
  useEventListenerOnce(Events.UpdatedBalances, anomaUpdatedBalancesHandler);
  useEventListenerOnce(KeplrEvents.AccountChanged, keplrAccountChangedHandler);
  useEventListenerOnce(
    MetamaskEvents.AccountChanged,
    metamaskAccountChangedHandler,
    false,
    true
  );

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
