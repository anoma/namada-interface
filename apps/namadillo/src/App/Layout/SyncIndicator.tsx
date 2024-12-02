import { Tooltip } from "@namada/components";
import { chainStatusAtom } from "atoms/chain";
import { syncStatusAtom } from "atoms/syncStatus/atoms";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";

export const SyncIndicator = (): JSX.Element => {
  const syncStatus = useAtomValue(syncStatusAtom);
  const chainStatus = useAtomValue(chainStatusAtom);

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
        : `Fully synced: height ${chainStatus?.height}, epoch ${chainStatus?.epoch}`
        }
      </Tooltip>
    </div>
  );
};
