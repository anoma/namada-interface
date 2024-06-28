import { useEventListenerOnce } from "@namada/hooks";
import { Events } from "@namada/types";
import { accountBalanceAtom, defaultAccountAtom } from "atoms/accounts";
import { namadaExtensionConnectionStatus } from "atoms/settings";
import { useAtomValue, useSetAtom } from "jotai";

export const useExtensionEvents = (): void => {
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
};
