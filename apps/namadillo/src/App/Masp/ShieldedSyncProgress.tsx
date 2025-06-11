import { shieldedBalanceAtom, shieldedSyncProgress } from "atoms/balance/atoms";
import { useRequiresNewShieldedSync } from "hooks/useRequiresNewShieldedSync";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

export const ShieldedSyncProgress = (): JSX.Element => {
  const syncProgress = useAtomValue(shieldedSyncProgress);
  const { isFetching } = useAtomValue(shieldedBalanceAtom);
  const [showShieldedSync, setShowShieldedSync] = useState(false);
  const requiresNewShieldedSync = useRequiresNewShieldedSync();

  const roundedProgress = useMemo(() => {
    // Only update when the progress changes by at least 1%
    return Math.min(Math.floor(syncProgress * 100), 100);
  }, [Math.floor(syncProgress * 100)]);

  useEffect(() => {
    let timeout = undefined;
    if (isFetching && roundedProgress < 100) {
      // wait 2.5 s before we allow the ring to appear
      timeout = setTimeout(() => setShowShieldedSync(true), 2500);
    } else {
      setShowShieldedSync(false);
    }
    return () => clearTimeout(timeout);
  }, [isFetching, roundedProgress]);

  if (!showShieldedSync && !requiresNewShieldedSync) {
    return <></>;
  }

  return (
    <div className="relative bg-black text-yellow rounded-sm overflow-hidden text-xs font-medium py-2 px-3">
      Shielded sync{" "}
      {syncProgress === 1 ? "converting..." : `progress: ${roundedProgress}%`}
      <div
        className={twMerge(
          "absolute bg-yellow top-0 left-0 w-full h-full mix-blend-difference origin-left",
          roundedProgress > 0 && "transition-all"
        )}
        style={{ transform: `scaleX(${roundedProgress}%)` }}
      />
    </div>
  );
};
