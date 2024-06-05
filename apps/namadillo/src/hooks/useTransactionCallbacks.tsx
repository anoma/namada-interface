import { useEffectSkipFirstRender } from "@namada/hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { balancesAtom } from "slices/accounts";
import { shouldUpdateBalanceAtom } from "slices/etc";
import { addTransactionEvent } from "utils";

export const useTransactionCallback = (): void => {
  const { refetch: refetchBalances } = useAtomValue(balancesAtom);
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
