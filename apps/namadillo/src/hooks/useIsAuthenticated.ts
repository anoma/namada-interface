import { defaultAccountAtom } from "atoms/accounts";
import { useAtomValue } from "jotai";

export const useUserHasAccount = (): boolean => {
  const account = useAtomValue(defaultAccountAtom);
  return !!account.data;
};
