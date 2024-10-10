import { defaultAccountAtom } from "atoms/accounts";
import { useAtomValue } from "jotai";

export const useIsAuthenticated = (): boolean => {
  const account = useAtomValue(defaultAccountAtom);
  return !!account.data;
};
