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
import { chainAtom } from "slices/chain";
import { isRevealPkNeededAtom } from "slices/fees";
import {
  dispatchToastNotificationAtom,
  filterToastNotificationsAtom,
} from "slices/notifications";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { myValidatorsAtom } from "slices/validators";
import { NamadaConnectionRevokedHandler } from "./handlers";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const namadaIntegration = useIntegration("namada");
  const keplrIntegration = useIntegration("cosmos");
  const metamaskIntegration = useIntegration("ethereum");
  const fetchDefaultAccount = useSetAtom(fetchDefaultAccountAtom);
  const balances = useAtomValue(balancesAtom);
  const myValidators = useAtomValue(myValidatorsAtom);
  const addAccounts = useSetAtom(addAccountsAtom);
  const refreshChain = useSetAtom(chainAtom);
  const refreshPublicKeys = useSetAtom(isRevealPkNeededAtom);
  const setNamadaExtensionConnected = useSetAtom(namadaExtensionConnectedAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const dismissNotifications = useSetAtom(filterToastNotificationsAtom);

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

  useEventListenerOnce(Events.TxCompleted, () => {
    refreshPublicKeys();
    balances.refetch();
  });

  useEventListenerOnce(Events.UpdatedBalances, () => {
    balances.refetch();
  });

  useEventListenerOnce(Events.UpdatedStaking, () => {
    myValidators.refetch();

    //TODO: Find a way to dismiss notifications by their id
    dismissNotifications(
      ({ data }) =>
        !(data.type === "pending" && data.id.indexOf("staking") >= 0)
    );

    dispatchNotification(
      {
        id: "staking-success",
        type: "success",
        title: "Transaction processed successfully!",
        description:
          "Your staking transaction has been processed and your balance has been updated",
      },
      { timeout: 5000 }
    );
  });

  useEventListenerOnce(Events.NetworkChanged, () => {
    refreshChain();
  });

  useEventListenerOnce(Events.ProposalsUpdated, () => {
    dismissNotifications(
      ({ data }) =>
        !(data.type === "pending" && data.id.indexOf("proposal-voted") >= 0)
    );

    dispatchNotification(
      {
        id: "proposal-success",
        type: "success",
        title: "Voting processed successfully!",
        description: "Your vote has been successfully computed.",
      },
      { timeout: 5000 }
    );
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
