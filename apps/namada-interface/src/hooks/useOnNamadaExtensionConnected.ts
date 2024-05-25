import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { fetchAccountsAtom, fetchDefaultAccountAtom } from "slices/accounts";
import { namadaExtensionConnectedAtom } from "slices/settings";

export const useOnNamadaExtensionConnected = (): void => {
  const connected = useAtomValue(namadaExtensionConnectedAtom);
  const fetchAccounts = useSetAtom(fetchAccountsAtom);
  const fetchDefaultAccount = useSetAtom(fetchDefaultAccountAtom);

  useEffect(() => {
    if (connected) {
      fetchAccounts();
      fetchDefaultAccount();
    }
  }, [connected]);
};
