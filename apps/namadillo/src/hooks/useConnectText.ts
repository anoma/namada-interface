import { defaultAccountAtom } from "atoms/accounts";
import {
  namadaExtensionAttachStatus,
  namadaExtensionConnectionStatus,
} from "atoms/settings";
import { useAtomValue } from "jotai";

export const useConnectText = (): string => {
  const isExtensionAttached =
    useAtomValue(namadaExtensionAttachStatus) === "attached";

  const isExtensionConnected =
    useAtomValue(namadaExtensionConnectionStatus) === "connected";

  const account = useAtomValue(defaultAccountAtom);
  const hasDefaultAccount = !!account.data;

  if (!isExtensionAttached) {
    return "please download the Namada Keychain";
  }

  if (!isExtensionConnected) {
    return "please connect the Namada Keychain";
  }

  if (!hasDefaultAccount) {
    return "please create or import an account using Namada Keychain";
  }

  return "";
};
