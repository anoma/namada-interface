import { createContext } from "react";

import { useEventListenerOnce } from "@namada/hooks";
import { Keplr, Metamask, Namada, useIntegration } from "@namada/integrations";
import { Events, KeplrEvents, MetamaskEvents } from "@namada/types";

import { useAppDispatch } from "store";
import {
  KeplrAccountChangedHandler,
  MetamaskAccountChangedHandler,
  MetamaskBridgeTransferCompletedHandler,
  NamadaAccountChangedHandler,
  NamadaConnectionRevokedHandler,
  NamadaNetworkChangedHandler,
  NamadaProposalsUpdatedHandler,
  NamadaTxCompletedHandler,
  NamadaTxStartedHandler,
  NamadaUpdatedBalancesHandler,
  NamadaUpdatedStakingHandler,
} from "./handlers";

import { useSetAtom } from "jotai";
import { refreshAccountsAtom, refreshBalancesAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";
import { isRevealPkNeededAtom } from "slices/fees";
import { namadaExtensionConnectedAtom } from "slices/settings";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const namadaIntegration = useIntegration("namada");
  const keplrIntegration = useIntegration("cosmos");
  const metamaskIntegration = useIntegration("ethereum");

  const refreshAccounts = useSetAtom(refreshAccountsAtom);
  const refreshChain = useSetAtom(chainAtom);
  const refreshBalances = useSetAtom(refreshBalancesAtom);
  const refreshPublicKeys = useSetAtom(isRevealPkNeededAtom);
  const setNamadaExtensionConnected = useSetAtom(namadaExtensionConnectedAtom);

  // Instantiate handlers:
  const namadaAccountChangedHandler = NamadaAccountChangedHandler(
    dispatch,
    namadaIntegration as Namada,
    refreshAccounts
  );
  const namadaNetworkChangedHandler = NamadaNetworkChangedHandler(
    dispatch,
    namadaIntegration as Namada,
    refreshChain
  );
  const namadaTxStartedHandler = NamadaTxStartedHandler(dispatch);
  const namadaTxCompletedHandler = NamadaTxCompletedHandler(
    dispatch,
    refreshPublicKeys
  );
  const namadaUpdatedBalancesHandler = NamadaUpdatedBalancesHandler(
    dispatch,
    refreshBalances
  );
  const namadaUpdatedStakingHandler = NamadaUpdatedStakingHandler(dispatch);
  const namadaProposalsUpdatedHandler = NamadaProposalsUpdatedHandler(dispatch);
  const namadaConnectionRevokedHandler = NamadaConnectionRevokedHandler(
    namadaIntegration as Namada,
    setNamadaExtensionConnected
  );

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
  useEventListenerOnce(Events.NetworkChanged, namadaNetworkChangedHandler);
  useEventListenerOnce(Events.UpdatedBalances, namadaUpdatedBalancesHandler);
  useEventListenerOnce(Events.UpdatedStaking, namadaUpdatedStakingHandler);
  useEventListenerOnce(Events.TxStarted, namadaTxStartedHandler);
  useEventListenerOnce(Events.TxCompleted, namadaTxCompletedHandler);
  useEventListenerOnce(Events.ProposalsUpdated, namadaProposalsUpdatedHandler);
  useEventListenerOnce(
    Events.ConnectionRevoked,
    namadaConnectionRevokedHandler
  );
  useEventListenerOnce(KeplrEvents.AccountChanged, keplrAccountChangedHandler);
  useEventListenerOnce(
    MetamaskEvents.AccountChanged,
    metamaskAccountChangedHandler,
    false,
    (event, handler) => {
      if (window.ethereum) {
        //TODO: fix as
        window.ethereum.on(event, handler as () => unknown);
      }
    },
    (event, handler) => {
      if (window.ethereum) {
        window.ethereum.removeListener(event, handler);
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
