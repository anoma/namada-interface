import { createContext } from "react";

import { Events, KeplrEvents, MetamaskEvents } from "@namada/types";
import {
  defaultChainId,
  defaultCosmosChainId,
  defaultEthereumChainId,
} from "@namada/chains";
import { Namada, Keplr, Metamask } from "@namada/integrations";
import { useEventListenerOnce, useIntegration } from "@namada/hooks";

import { useAppDispatch } from "store";
import {
  NamadaAccountChangedHandler,
  NamadaTxStartedHandler,
  NamadaTxCompletedHandler,
  NamadaUpdatedBalancesHandler,
  NamadaUpdatedStakingHandler,
  KeplrAccountChangedHandler,
  MetamaskAccountChangedHandler,
} from "./handlers";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const namadaIntegration = useIntegration(defaultChainId);
  const keplrIntegration = useIntegration(defaultCosmosChainId);
  const metamaskIntegration = useIntegration(defaultEthereumChainId);

  // Instantiate handlers:
  const namadaAccountChangedHandler = NamadaAccountChangedHandler(
    dispatch,
    namadaIntegration as Namada
  );
  const namadaTxStartedHandler = NamadaTxStartedHandler(dispatch);
  const namadaTxCompletedHandler = NamadaTxCompletedHandler(dispatch);
  const namadaUpdatedBalancesHandler = NamadaUpdatedBalancesHandler(dispatch);
  const namadaUpdatedStakingHandler = NamadaUpdatedStakingHandler(dispatch);

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
  useEventListenerOnce(Events.AccountChanged, namadaAccountChangedHandler);
  useEventListenerOnce(Events.UpdatedBalances, namadaUpdatedBalancesHandler);
  useEventListenerOnce(Events.UpdatedStaking, namadaUpdatedStakingHandler);
  useEventListenerOnce(Events.TxStarted, namadaTxStartedHandler);
  useEventListenerOnce(Events.TxCompleted, namadaTxCompletedHandler);
  useEventListenerOnce(KeplrEvents.AccountChanged, keplrAccountChangedHandler);
  useEventListenerOnce(
    MetamaskEvents.AccountChanged,
    metamaskAccountChangedHandler,
    false,
    (event, handler) => {
      if (window.ethereum) {
        window.ethereum.on(event, handler);
      }
    },
    (event, handler) => {
      if (window.ethereum) {
        window.ethereum.removeListener(event, handler);
      }
    }
  );

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
