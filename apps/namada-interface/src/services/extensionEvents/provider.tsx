import { createContext } from "react";

import { Events, KeplrEvents, MetamaskEvents } from "@namada/types";
import {
  defaultChainId,
  defaultCosmosChainId,
  defaultEthereumChainId,
} from "@namada/chains";
import {
  Namada,
  Keplr,
  Metamask,
  useIntegration,
  MetamaskWindow,
} from "@namada/integrations";
import { useEventListenerOnce } from "@namada/hooks";

import { useAppDispatch } from "store";
import {
  KeplrAccountChangedHandler,
  MetamaskAccountChangedHandler,
  NamadaAccountChangedHandler,
  NamadaTxStartedHandler,
  NamadaTxCompletedHandler,
  NamadaUpdatedBalancesHandler,
  NamadaUpdatedStakingHandler,
  MetamaskBridgeTransferCompletedHandler,
  NamadaProposalsUpdatedHandler,
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
  const namadaProposalsUpdatedHandler = NamadaProposalsUpdatedHandler(dispatch);

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

  const metamaskBridgeTransferCompletedHandler =
    MetamaskBridgeTransferCompletedHandler(dispatch);

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, namadaAccountChangedHandler);
  useEventListenerOnce(Events.UpdatedBalances, namadaUpdatedBalancesHandler);
  useEventListenerOnce(Events.UpdatedStaking, namadaUpdatedStakingHandler);
  useEventListenerOnce(Events.TxStarted, namadaTxStartedHandler);
  useEventListenerOnce(Events.TxCompleted, namadaTxCompletedHandler);
  useEventListenerOnce(Events.ProposalsUpdated, namadaProposalsUpdatedHandler);
  useEventListenerOnce(KeplrEvents.AccountChanged, keplrAccountChangedHandler);
  useEventListenerOnce(
    MetamaskEvents.AccountChanged,
    metamaskAccountChangedHandler,
    false,
    (event, handler) => {
      if ((window as MetamaskWindow).ethereum) {
        //TODO: fix as
        (window as MetamaskWindow).ethereum.on(event, handler as () => unknown);
      }
    },
    (event, handler) => {
      if ((window as MetamaskWindow).ethereum) {
        (window as MetamaskWindow).ethereum.removeListener(event, handler);
      }
    }
  );
  useEventListenerOnce(
    MetamaskEvents.BridgeTransferCompleted,
    metamaskBridgeTransferCompletedHandler
  );

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
