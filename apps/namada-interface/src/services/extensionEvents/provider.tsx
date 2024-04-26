import { createContext } from "react";

import { useEventListenerOnce } from "@namada/hooks";
import { Keplr, Metamask, Namada, useIntegration } from "@namada/integrations";
import { Events, KeplrEvents, MetamaskEvents } from "@namada/types";

import { useAppDispatch } from "store";
import {
  KeplrAccountChangedHandler,
  MetamaskAccountChangedHandler,
  MetamaskBridgeTransferCompletedHandler,
  NamadaConnectionRevokedHandler,
  NamadaProposalsUpdatedHandler,
} from "./handlers";

import { useAtomValue, useSetAtom } from "jotai";
import { fetchAccountsAtom, fetchBalancesAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";
import { isRevealPkNeededAtom } from "slices/fees";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { myValidatorsAtom } from "slices/validators";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const namadaIntegration = useIntegration("namada");
  const keplrIntegration = useIntegration("cosmos");
  const metamaskIntegration = useIntegration("ethereum");
  const fetchAccounts = useSetAtom(fetchAccountsAtom);
  const fetchBalances = useSetAtom(fetchBalancesAtom);
  const myValidators = useAtomValue(myValidatorsAtom);
  const refreshChain = useSetAtom(chainAtom);
  const refreshPublicKeys = useSetAtom(isRevealPkNeededAtom);
  const setNamadaExtensionConnected = useSetAtom(namadaExtensionConnectedAtom);

  // Instantiate handlers:

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
  useEventListenerOnce(Events.AccountChanged, async () => {
    await fetchAccounts();
    fetchBalances();
  });

  useEventListenerOnce(Events.TxCompleted, () => {
    refreshPublicKeys();
    fetchBalances();
  });

  useEventListenerOnce(Events.UpdatedBalances, () => {
    fetchBalances();
  });

  useEventListenerOnce(Events.UpdatedStaking, () => {
    myValidators.refetch();
  });

  useEventListenerOnce(Events.NetworkChanged, () => {
    refreshChain();
  });

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
