import { useEffectSkipFirstRender } from "@namada/hooks";
import { useAtomValue } from "jotai";
import { accountBalanceAtom, defaultAccountAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";
import { minimumGasPriceAtom } from "slices/fees";

export const useOnChainChanged = (): void => {
  const chain = useAtomValue(chainAtom);
  const balances = useAtomValue(accountBalanceAtom);
  const accounts = useAtomValue(defaultAccountAtom);
  const gasPrice = useAtomValue(minimumGasPriceAtom);

  useEffectSkipFirstRender(() => {
    balances.refetch();
    accounts.refetch();
    gasPrice.refetch();
  }, [chain]);
};
