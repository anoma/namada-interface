import { useEventListenerOnce } from "@namada/hooks";
import { useIntegration } from "@namada/integrations";
import { Events } from "@namada/types";
import { accountNamBalanceAtom, defaultAccountAtom } from "atoms/accounts";
import { namadaExtensionConnectionStatus } from "atoms/settings";
import { useAtomValue, useSetAtom } from "jotai";

export const useExtensionEvents = (): void => {
  const defaultAccount = useAtomValue(defaultAccountAtom);
  const balances = useAtomValue(accountNamBalanceAtom);
  const integration = useIntegration("namada");

  const setNamadaExtensionConnected = useSetAtom(
    namadaExtensionConnectionStatus
  );

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, async () => {
    await defaultAccount.refetch();
    balances.refetch();
  });

  useEventListenerOnce(Events.ConnectionRevoked, async () => {
    setNamadaExtensionConnected(
      (await integration.isConnected()) ? "connected" : "idle"
    );
  });
};
