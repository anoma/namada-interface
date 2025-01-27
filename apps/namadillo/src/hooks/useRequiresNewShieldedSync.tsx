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
  const lastSync = useAtomValue(lastCompletedShieldedSyncAtom);
  const requiresNewSync =
    lastSync === undefined ||
    (!isComplete &&
      lastSync &&
      subMinutes(new Date(), minutesToNextSync) > lastSync);

  return requiresNewSync;
};
