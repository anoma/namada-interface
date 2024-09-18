import { defaultAccountAtom } from "atoms/accounts";
import { useAtomValue } from "jotai";

export const useUserHasAccount = (): boolean | undefined => {
  const account = useAtomValue(defaultAccountAtom);
  if (account.isPending) return undefined;
  return Boolean(account.data);
};
