import { defaultAccountAtom } from "atoms/accounts";
import {
  isShieldedSyncCompleteAtom,
  lastCompletedShieldedSyncAtom,
} from "atoms/balance";
import { subMinutes } from "date-fns";
import { useAtomValue } from "jotai";

type RequiresNewShieldedSyncProps = {
  minutesToNextSync?: number;
};

export const useRequiresNewShieldedSync = ({
  minutesToNextSync = 3,
}: RequiresNewShieldedSyncProps = {}): boolean => {
  const isComplete = useAtomValue(isShieldedSyncCompleteAtom);
  const syncPerAccount = useAtomValue(lastCompletedShieldedSyncAtom);
  const account = useAtomValue(defaultAccountAtom);

  if (!account?.data) {
    return false;
  }

  const lastSync = syncPerAccount[account.data.address];
  const requiresNewSync =
    lastSync === undefined ||
    (!isComplete &&
      lastSync &&
      subMinutes(new Date(), minutesToNextSync) > new Date(lastSync));

  return requiresNewSync;
};
