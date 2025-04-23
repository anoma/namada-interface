import { shieldedBalanceAtom, shieldedSyncProgress } from "atoms/balance/atoms";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

export const ShieldedSyncProgress = (): JSX.Element => {
  const syncProgress = useAtomValue(shieldedSyncProgress);
  const { isFetching } = useAtomValue(shieldedBalanceAtom);

  const roundedProgress = useMemo(() => {
    // Only update when the progress changes by at least 1%
    return Math.min(Math.floor(syncProgress * 100), 100);
  }, [Math.floor(syncProgress * 100)]);

  if (!isFetching) {
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
