import { useEventListenerOnce } from "@namada/hooks";
import { Namada, useIntegration } from "@namada/integrations";
import { Events, KeplrEvents, MetamaskEvents } from "@namada/types";
import { useAtomValue, useSetAtom } from "jotai";
import { createContext } from "react";
import {
  addAccountsAtom,
  balancesAtom,
  fetchDefaultAccountAtom,
} from "slices/accounts";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { NamadaConnectionRevokedHandler } from "./handlers";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const namadaIntegration = useIntegration("namada");
  const keplrIntegration = useIntegration("cosmos");
  const metamaskIntegration = useIntegration("ethereum");
  const fetchDefaultAccount = useSetAtom(fetchDefaultAccountAtom);
  const balances = useAtomValue(balancesAtom);
  const addAccounts = useSetAtom(addAccountsAtom);
  const setNamadaExtensionConnected = useSetAtom(namadaExtensionConnectedAtom);

  // Instantiate handlers:
  const namadaConnectionRevokedHandler = NamadaConnectionRevokedHandler(
    namadaIntegration as Namada,
    setNamadaExtensionConnected
  );

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, async () => {
    await fetchDefaultAccount();
    balances.refetch();
  });

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
