import { accountBalanceAtom } from "atoms/accounts";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { useAtomValue, useSetAtom } from "jotai";
import { useTransactionEventListener } from "utils";

export const useTransactionCallback = (): void => {
  const { refetch: refetchBalances } = useAtomValue(accountBalanceAtom);
  const shouldUpdateBalance = useSetAtom(shouldUpdateBalanceAtom);

  const onBalanceUpdate = (): void => {
    // TODO: refactor this after event subscription is enabled on indexer
    shouldUpdateBalance(true);
    refetchBalances();

    const timePolling = 6 * 1000;
    setTimeout(() => shouldUpdateBalance(false), timePolling);
  };

  useTransactionEventListener("Bond.Success", onBalanceUpdate);
  useTransactionEventListener("Unbond.Success", onBalanceUpdate);
  useTransactionEventListener("Withdraw.Success", onBalanceUpdate);
};
