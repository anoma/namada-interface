import { useEventListenerOnce } from "@namada/hooks";
import { Events } from "@namada/types";
import { useAtomValue, useSetAtom } from "jotai";
import { createContext } from "react";
import { accountBalanceAtom, defaultAccountAtom } from "slices/accounts";
import { namadaExtensionConnectionStatus } from "slices/settings";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const defaultAccount = useAtomValue(defaultAccountAtom);
  const balances = useAtomValue(accountBalanceAtom);
  const setNamadaExtensionConnected = useSetAtom(
    namadaExtensionConnectionStatus
  );

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, async () => {
    await defaultAccount.refetch();
    balances.refetch();
  });

  useEventListenerOnce(Events.ConnectionRevoked, () =>
    setNamadaExtensionConnected("idle")
  );

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
