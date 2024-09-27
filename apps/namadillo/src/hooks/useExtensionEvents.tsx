import { useEventListenerOnce } from "@namada/hooks";
import { useIntegration } from "@namada/integrations";
import { Events } from "@namada/types";
import { accountBalanceAtom, defaultAccountAtom } from "atoms/accounts";
import { chainParametersAtom } from "atoms/chain";
import { namadaExtensionConnectionStatus } from "atoms/settings";
import { useAtomValue, useSetAtom } from "jotai";

export const useExtensionEvents = (): void => {
  const defaultAccount = useAtomValue(defaultAccountAtom);
  const balances = useAtomValue(accountBalanceAtom);
  const chainParams = useAtomValue(chainParametersAtom);
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
      (await integration.isConnected(chainParams.data!.chainId)) ?
        "connected"
      : "idle"
    );
  });
};
