import { defaultAccountAtom } from "atoms/accounts";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import { useAtomValue } from "jotai";

export const useIsAuthenticated = (): boolean => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const account = useAtomValue(defaultAccountAtom);
  return isConnected && !!account.data;
};
