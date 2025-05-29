import { Tooltip } from "@namada/components";
import { indexerApiAtom } from "atoms/api";
import { shieldedBalanceAtom, shieldedSyncProgress } from "atoms/balance/atoms";
import { fetchBlockHeightByTimestamp } from "atoms/balance/services";
import { chainStatusAtom } from "atoms/chain";
import {
  indexerServicesSyncStatusAtom,
  syncStatusAtom,
} from "atoms/syncStatus/atoms";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { PulsingRing } from "../Common/PulsingRing";

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
  const api = useAtomValue(indexerApiAtom);
  const chainStatus = useAtomValue(chainStatusAtom);
  const shieldedProgress = useAtomValue(shieldedSyncProgress);
  const { isFetching: isShieldedFetching } = useAtomValue(shieldedBalanceAtom);
  const [blockHeightSync, setBlockHeightSync] = useState<boolean | null>(null);
  const [indexerBlockHeight, setIndexerBlockHeight] = useState<number | null>(
    null
  );
  const [showShieldedSync, setShowShieldedSync] = useState(false);
  const roundedProgress = useMemo(() => {
    // Only update when the progress changes by at least 1%
    return Math.min(Math.floor(shieldedProgress * 100), 100);
  }, [Math.floor(shieldedProgress * 100)]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (isShieldedFetching && roundedProgress < 100) {
      // wait 2.5 s before we allow the ring to appear
      timeout = setTimeout(() => setShowShieldedSync(true), 2500);
    } else {
      setShowShieldedSync(false);
    }
    return () => clearTimeout(timeout);
  }, [isShieldedFetching, roundedProgress]);

  const { errors } = syncStatus;
  const { services } = indexerServicesSyncStatus;

  const isChainStatusError =
    !chainStatus?.height || !chainStatus?.epoch || !blockHeightSync;
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
    <div className="flex gap-10 px-2 py-3">
      {showShieldedSync && (
        <div className="relative group/tooltip">
          <div className="relative mt-1">
            <PulsingRing size="small" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full" />
          </div>
          <Tooltip
            position="bottom"
            className="z-10 w-max max-w-[220px] rounded-md p-4 -mb-6"
          >
            <div className="space-y-3">
              <div className="text-md text-yellow">
                Shielded sync: {roundedProgress}%
              </div>
              <div className="w-full bg-yellow-900 h-1">
                <div
                  className="bg-yellow-500 h-1 transition-all duration-300"
                  style={{ width: `${roundedProgress}%` }}
                />
              </div>
              <div className="text-sm text-neutral-400">
                Syncing your shielded assets now. Balances will update in a few
                seconds.
              </div>
            </div>
          </Tooltip>
        </div>
      )}

      <div className="relative group/tooltip">
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
          className="z-10 w-max max-w-[200px] text-balance -mb-6"
        >
          {isSyncing ?
            "Syncing..."
          : isError ?
            <div>
              {formatError(errors, "Error")}
              {formatError(services, "Lagging services")}
              {isChainStatusError && "Chain status not loaded."}
            </div>
          : <div className="py-2">
              <div className="text-yellow font-medium">Fully synced:</div>
              <div>RPC Height: {chainStatus?.height}</div>
              <div>Indexer Height: {indexerBlockHeight}</div>
              <div>Epoch: {chainStatus?.epoch}</div>
            </div>
          }
        </Tooltip>
      </div>
    </div>
  );
};
