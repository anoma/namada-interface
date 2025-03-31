import { useEventListenerOnce } from "@namada/hooks";
import { Events } from "@namada/types";
import {
  accountBalanceAtom,
  accountsAtom,
  defaultAccountAtom,
} from "atoms/accounts";
import { namadaExtensionConnectionStatus } from "atoms/settings";
import { useAtomValue, useSetAtom } from "jotai";
import { useNamadaKeychain } from "./useNamadaKeychain";

export const useExtensionEvents = (): void => {
  const accounts = useAtomValue(accountsAtom);
  const defaultAccount = useAtomValue(defaultAccountAtom);
  const balances = useAtomValue(accountBalanceAtom);
  const { namadaKeychain } = useNamadaKeychain();

  const setNamadaExtensionConnected = useSetAtom(
    namadaExtensionConnectionStatus
  );

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, async () => {
    await accounts.refetch();
    await defaultAccount.refetch();
    balances.refetch();
  });

  useEventListenerOnce(Events.ConnectionRevoked, async () => {
    const injectedNamada = await namadaKeychain.get();
    setNamadaExtensionConnected(
      (await injectedNamada?.isConnected()) ? "connected" : "idle"
    );
  });

  useEventListenerOnce(Events.ExtensionLocked, async () => {
    setNamadaExtensionConnected("idle");
  });

  useEventListenerOnce(Events.ExtensionUnlocked, async () => {
    const injectedNamada = await namadaKeychain.get();
    setNamadaExtensionConnected(
      (await injectedNamada?.isConnected()) ? "connected" : "idle"
    );
  });
};
