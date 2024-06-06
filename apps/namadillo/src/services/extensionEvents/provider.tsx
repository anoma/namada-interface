import { useEventListenerOnce } from "@namada/hooks";
import { Namada, useIntegration } from "@namada/integrations";
import { Events } from "@namada/types";
import { useAtomValue, useSetAtom } from "jotai";
import { createContext } from "react";
import { accountBalanceAtom, defaultAccountAtom } from "slices/accounts";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { NamadaConnectionRevokedHandler } from "./handlers";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const namadaIntegration = useIntegration("namada");
  const defaultAccount = useAtomValue(defaultAccountAtom);
  const balances = useAtomValue(accountBalanceAtom);
  const setNamadaExtensionConnected = useSetAtom(namadaExtensionConnectedAtom);

  // Instantiate handlers:
  const namadaConnectionRevokedHandler = NamadaConnectionRevokedHandler(
    namadaIntegration as Namada,
    setNamadaExtensionConnected
  );

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, async () => {
    await defaultAccount.refetch();
    balances.refetch();
  });

  useEventListenerOnce(
    Events.ConnectionRevoked,
    namadaConnectionRevokedHandler
  );

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
