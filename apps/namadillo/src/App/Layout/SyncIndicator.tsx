import { Tooltip } from "@namada/components";
import { chainStatusAtom } from "atoms/chain";
import {
  indexerServicesSyncStatusAtom,
  syncStatusAtom,
} from "atoms/syncStatus/atoms";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";

export const SyncIndicator = (): JSX.Element => {
  const syncStatus = useAtomValue(syncStatusAtom);
  const indexerServicesSyncStatus = useAtomValue(indexerServicesSyncStatusAtom);
  const chainStatus = useAtomValue(chainStatusAtom);

  const isError = syncStatus.isError || indexerServicesSyncStatus.isError;
  const isSyncing = syncStatus.isSyncing || indexerServicesSyncStatus.isSyncing;
  const { services } = indexerServicesSyncStatus;

  return (
    <div className="relative group/tooltip p-1">
      <div
        className={twMerge(
          "w-2 h-2 rounded-full",
          "bg-green-500",
          isSyncing && "bg-yellow-500 animate-pulse",
          isError && !isSyncing && "bg-red-500"
        )}
      />
      <Tooltip className="whitespace-nowrap">
        {isSyncing ?
          "Syncing"
        : isError ?
          `Error syncing ${services.length ? `. Lagging services: ${services.join(", ")}.` : ""}`
        : `Fully synced: height ${chainStatus?.height}, epoch ${chainStatus?.epoch}`
        }
      </Tooltip>
    </div>
  );
};
