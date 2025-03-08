import { routes } from "App/routes";
import {
  lastCompletedShieldedSyncAtom,
  storageShieldedBalanceAtom,
  storageShieldedRewardsAtom,
} from "atoms/balance/atoms";
import { chainParametersAtom } from "atoms/chain";
import {
  clearShieldedContextAtom,
  indexerHeartbeatAtom,
  lastInvalidateShieldedContextAtom,
} from "atoms/settings";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";

export const useInvalidateShieldedContext = (): (() => Promise<void>) => {
  const [clearShieldedContext] = useAtom(clearShieldedContextAtom);
  const setStorageShieldedBalance = useSetAtom(storageShieldedBalanceAtom);
  const setLastCompletedShieldedSync = useSetAtom(
    lastCompletedShieldedSyncAtom
  );
  const setStorageShieldedRewards = useSetAtom(storageShieldedRewardsAtom);
  const setLastInvalidate = useSetAtom(lastInvalidateShieldedContextAtom);

  const chainParameters = useAtomValue(chainParametersAtom);
  const indexerInfo = useAtomValue(indexerHeartbeatAtom);

  const chainId = chainParameters.data?.chainId ?? "";
  const indexerVersion = indexerInfo.data?.version ?? "";

  return async () => {
    await clearShieldedContext.mutateAsync();
    setStorageShieldedBalance(RESET);
    setLastCompletedShieldedSync(RESET);
    setStorageShieldedRewards(RESET);
    setLastInvalidate((prev) => ({ ...prev, [chainId]: indexerVersion }));
    location.href = routes.root;
  };
};
