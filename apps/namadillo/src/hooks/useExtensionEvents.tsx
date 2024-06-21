import { useEventListenerOnce } from "@namada/hooks";
import { Events } from "@namada/types";
import { useAtomValue, useSetAtom } from "jotai";
import { accountBalanceAtom, defaultAccountAtom } from "slices/accounts";
import { namadaExtensionConnectionStatus } from "slices/settings";

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
