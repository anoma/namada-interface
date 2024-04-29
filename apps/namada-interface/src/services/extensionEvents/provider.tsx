import { createContext } from "react";

import { useEventListenerOnce } from "@namada/hooks";
import { Namada, useIntegration } from "@namada/integrations";
import { Events, KeplrEvents, MetamaskEvents } from "@namada/types";

import { useAppDispatch } from "store";
import {
  NamadaConnectionRevokedHandler,
  NamadaProposalsUpdatedHandler,
} from "./handlers";

import { useAtomValue, useSetAtom } from "jotai";
import {
  addAccountsAtom,
  balancesAtom,
  fetchAccountsAtom,
} from "slices/accounts";
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
  const balances = useAtomValue(balancesAtom);
  const myValidators = useAtomValue(myValidatorsAtom);
  const addAccounts = useSetAtom(addAccountsAtom);
  const refreshChain = useSetAtom(chainAtom);
  const refreshPublicKeys = useSetAtom(isRevealPkNeededAtom);
  const setNamadaExtensionConnected = useSetAtom(namadaExtensionConnectedAtom);

  // Instantiate handlers:

  const namadaProposalsUpdatedHandler = NamadaProposalsUpdatedHandler(dispatch);
  const namadaConnectionRevokedHandler = NamadaConnectionRevokedHandler(
    namadaIntegration as Namada,
    setNamadaExtensionConnected
  );

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, async () => {
    await fetchAccounts();
    balances.refetch();
  });

  useEventListenerOnce(Events.TxCompleted, () => {
    refreshPublicKeys();
    balances.refetch();
  });

  useEventListenerOnce(Events.UpdatedBalances, () => {
    balances.refetch();
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

  useEventListenerOnce(KeplrEvents.AccountChanged, async () => {
    const accounts = await keplrIntegration.accounts();
    if (accounts) {
      addAccounts(accounts);
      balances.refetch();
    }
  });

  useEventListenerOnce(
    MetamaskEvents.AccountChanged,
    async () => {
      const accounts = await metamaskIntegration.accounts();
      if (accounts) {
        addAccounts(accounts);
        balances.refetch();
      }
    },
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

  useEventListenerOnce(MetamaskEvents.BridgeTransferCompleted, async () => {
    balances.refetch();
  });

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
