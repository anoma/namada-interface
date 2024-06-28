import { useEffectSkipFirstRender } from "@namada/hooks";
import { accountBalanceAtom } from "atoms/accounts";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { useAtomValue, useSetAtom } from "jotai";
import { addTransactionEvent } from "utils";

export const useTransactionCallback = (): void => {
  const { refetch: refetchBalances } = useAtomValue(accountBalanceAtom);
  const shouldUpdateBalance = useSetAtom(shouldUpdateBalanceAtom);

  useEffectSkipFirstRender(() => {
    initEvents();
  }, []);

  const onBalanceUpdate = (): void => {
    // TODO: refactor this after event subscription is enabled on indexer
    shouldUpdateBalance(true);
    refetchBalances();

    const timePolling = 6 * 1000;
    setTimeout(() => shouldUpdateBalance(false), timePolling);
  };

  const initEvents = (): void => {
    addTransactionEvent("Bond.Success", onBalanceUpdate);
    addTransactionEvent("Unbond.Success", onBalanceUpdate);
    addTransactionEvent("Withdraw.Success", onBalanceUpdate);
  };
};
