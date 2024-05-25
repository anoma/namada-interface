import { useEffectSkipFirstRender } from "@namada/hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { chainAtom } from "slices/chain";
import { isRevealPkNeededAtom, minimumGasPriceAtom } from "slices/fees";

export const useOnChainChanged = (): void => {
  const chain = useAtomValue(chainAtom);
  useAtomValue(minimumGasPriceAtom);
  const refreshPublicKeys = useSetAtom(isRevealPkNeededAtom);
  useEffectSkipFirstRender(() => {
    refreshPublicKeys();
  }, [chain]);
};
