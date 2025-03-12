import { routes } from "App/routes";
import {
  lastCompletedShieldedSyncAtom,
  storageShieldedBalanceAtom,
  storageShieldedRewardsAtom,
} from "atoms/balance/atoms";
import { chainParametersAtom } from "atoms/chain";
import {
  clearShieldedContextAtom,
  lastInvalidateShieldedContextAtom,
  maspIndexerHeartbeatAtom,
} from "atoms/settings";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { version } from "../../package.json";

export const useInvalidateShieldedContext = (): (() => Promise<void>) => {
  const [clearShieldedContext] = useAtom(clearShieldedContextAtom);
  const setStorageShieldedBalance = useSetAtom(storageShieldedBalanceAtom);
  const setLastCompletedShieldedSync = useSetAtom(
    lastCompletedShieldedSyncAtom
  );
  const setStorageShieldedRewards = useSetAtom(storageShieldedRewardsAtom);
  const setLastInvalidate = useSetAtom(lastInvalidateShieldedContextAtom);

  const chainParameters = useAtomValue(chainParametersAtom);
  const maspIndexerInfo = useAtomValue(maspIndexerHeartbeatAtom);

  const chainId = chainParameters.data?.chainId ?? "";
  const maspIndexerVersion = maspIndexerInfo.data?.version ?? "";

  return async () => {
    await clearShieldedContext.mutateAsync();
    setStorageShieldedBalance(RESET);
    setLastCompletedShieldedSync(RESET);
    setStorageShieldedRewards(RESET);
    setLastInvalidate((prev) => ({
      ...prev,
      [chainId]: {
        date: new Date().toISOString(),
        namadilloVersion: version,
        maspIndexerVersion: maspIndexerVersion,
      },
    }));
    location.href = routes.root;
  };
};
