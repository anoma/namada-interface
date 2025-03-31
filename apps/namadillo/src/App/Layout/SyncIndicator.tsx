import { Tooltip } from "@namada/components";
import { indexerApiAtom } from "atoms/api";
import { fetchBlockHeightByTimestamp } from "atoms/balance/services";
import { chainStatusAtom } from "atoms/chain";
import {
  indexerServicesSyncStatusAtom,
  syncStatusAtom,
} from "atoms/syncStatus/atoms";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const formatError = (
  errors: (string | Error)[],
  label?: string
): JSX.Element => {
  if (!errors.length) {
    return <></>;
  }

  return (
    <div>
      {label && <div>{label}:</div>}
      {errors.map((e) => {
        const string = e instanceof Error ? e.message : String(e);
        return <div key={string}>{string}</div>;
      })}
    </div>
  );
};

export const SyncIndicator = (): JSX.Element => {
  const syncStatus = useAtomValue(syncStatusAtom);
  const indexerServicesSyncStatus = useAtomValue(indexerServicesSyncStatusAtom);
  const chainStatus = useAtomValue(chainStatusAtom);
  const [blockHeightSync, setBlockHeightSync] = useState<boolean | null>(null);
  const [indexerBlockHeight, setIndexerBlockHeight] = useState<number | null>(
    null
  );
  const { errors } = syncStatus;
  const { services } = indexerServicesSyncStatus;
  const isChainStatusError =
    !chainStatus?.height || !chainStatus?.epoch || !blockHeightSync;
  const api = useAtomValue(indexerApiAtom);

  const isError =
    syncStatus.isError ||
    indexerServicesSyncStatus.isError ||
    isChainStatusError;

  const isSyncing =
    syncStatus.isSyncing ||
    indexerServicesSyncStatus.isSyncing ||
    !blockHeightSync;

  useEffect(() => {
    (async () => {
      const indexerBlockHeight = await fetchBlockHeightByTimestamp(
        api,
        Date.now()
      );
      setIndexerBlockHeight(indexerBlockHeight);
      setBlockHeightSync(indexerBlockHeight === chainStatus?.height);
    })();
  }, [chainStatus?.height]);

  return (
    <div className="relative group/tooltip px-1 py-3">
      <div
        className={twMerge(
          "w-2 h-2 rounded-full",
          "bg-green-500",
          isSyncing && "bg-yellow-500 animate-pulse",
          isError && !isSyncing && "bg-red-500"
        )}
      />
      <Tooltip
        position="bottom"
        className="z-10 w-max max-w-[200px] text-balance"
      >
        {isSyncing ?
          "Syncing"
        : isError ?
          <div>
            {formatError(errors, "Error")}
            {formatError(services, "Lagging services")}
            {isChainStatusError && "Chain status not loaded."}
          </div>
        : <div>
            <div>Fully synced:</div>
            <div>RPC Height: {chainStatus?.height}</div>
            <div>Indexer Height: {indexerBlockHeight}</div>
            <div>Epoch: {chainStatus?.epoch}</div>
          </div>
        }
      </Tooltip>
    </div>
  );
};
