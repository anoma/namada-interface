import { ActionButton, Stack } from "@namada/components";
import { routes } from "App/routes";
import {
  lastCompletedShieldedSyncAtom,
  storageShieldedBalanceAtom,
  storageShieldedRewardsAtom,
} from "atoms/balance/atoms";
import { clearShieldedContextAtom } from "atoms/settings";
import { useAtom, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";

export const SettingsMASP = (): JSX.Element => {
  const [clearShieldedContext] = useAtom(clearShieldedContextAtom);
  const setStorageShieldedBalance = useSetAtom(storageShieldedBalanceAtom);
  const setLastCompletedShieldedSync = useSetAtom(
    lastCompletedShieldedSyncAtom
  );
  const setStorageShieldedRewards = useSetAtom(storageShieldedRewardsAtom);

  const onInvalidateShieldedContext = async (): Promise<void> => {
    await clearShieldedContext.mutateAsync();
    setStorageShieldedBalance(RESET);
    setLastCompletedShieldedSync({});
    setStorageShieldedRewards(RESET);
    location.href = routes.root;
  };

  return (
    <Stack as="footer" className="px-5" gap={3}>
      <h2 className="text-base">Invalidate Shielded Context</h2>
      <p className="text-sm">
        In case your shielded balance is not updating correctly, you can
        invalidate the shielded context to force a rescan. This might take a few
        minutes to complete.
      </p>

      <ActionButton onClick={onInvalidateShieldedContext} className="shrink-0">
        Invalidate Shielded Context
      </ActionButton>
    </Stack>
  );
};
