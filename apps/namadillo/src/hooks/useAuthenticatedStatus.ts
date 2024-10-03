import { defaultAccountAtom } from "atoms/accounts";
import { namadaExtensionConnectionStatus } from "atoms/settings";
import { useAtomValue } from "jotai";

export const useAuthenticatedStatus = (): {
  isAuthenticated: boolean;
  isExtensionConnected: boolean;
  hasDefaultAccount: boolean;
} => {
  const isExtensionConnected =
    useAtomValue(namadaExtensionConnectionStatus) === "connected";

  const account = useAtomValue(defaultAccountAtom);
  const hasDefaultAccount = !!account.data;

  return {
    isAuthenticated: isExtensionConnected && hasDefaultAccount,
    isExtensionConnected,
    hasDefaultAccount,
  };
};
