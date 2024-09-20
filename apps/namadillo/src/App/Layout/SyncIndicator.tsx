import { Tooltip } from "@namada/components";
import { syncStatusAtom } from "atoms/syncStatus/atoms";
import { useChainStatus } from "hooks/useChainStatus";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";

export const SyncIndicator = (): JSX.Element => {
  const syncStatus = useAtomValue(syncStatusAtom);
  const { data } = useChainStatus();

  return (
    <div className="relative group/tooltip p-1">
      <div
        className={twMerge(
          "w-2 h-2 rounded-full",
          "bg-green-500",
          syncStatus.isSyncing && "bg-yellow-500 animate-pulse",
          syncStatus.isError && "bg-red-500"
        )}
      />
      <Tooltip className="whitespace-nowrap">
        {syncStatus.isSyncing ?
          "Syncing"
        : syncStatus.isError ?
          "Error syncing"
        : `Fully synced: height ${data?.height}, epoch ${data?.epoch}`}
      </Tooltip>
    </div>
  );
};
