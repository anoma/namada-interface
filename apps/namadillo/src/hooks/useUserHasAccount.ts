import { accountBalanceAtom } from "atoms/accounts";
import { useAtomValue } from "jotai";

export const useUserHasAccount = (): boolean | undefined => {
  const account = useAtomValue(accountBalanceAtom);
  if (account.isPending) return undefined;
  return Boolean(account.data);
};
