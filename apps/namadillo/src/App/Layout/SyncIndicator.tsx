import { Tooltip } from "@namada/components";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PulsingRing } from "App/Common/PulsingRing";
import { indexerApiAtom } from "atoms/api";
import { shieldedSyncProgress } from "atoms/balance";
import { chainStatusAtom } from "atoms/chain";
import { fetchBlockHeightByTimestamp } from "atoms/chain/services";
import { allProposalsAtom, votedProposalsAtom } from "atoms/proposals";
import {
  indexerCrawlersInfoAtom,
  rpcUrlAtom,
  settingsAtom,
} from "atoms/settings";
import {
  indexerRequestsSyncStatusAtom,
  indexerServicesSyncStatusAtom,
  isQuerySyncing,
} from "atoms/syncStatus/atoms";
import { allValidatorsAtom, myValidatorsAtom } from "atoms/validators";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { IoCheckmarkCircle } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

const StatusEntry = ({
  label,
  number,
  isSuccess,
}: {
  label: string;
  number?: number | null;
  isSuccess: boolean;
}): JSX.Element => {
  return (
    <div className="flex justify-between items-center gap-1">
      <div className="flex-1">{label}:</div>
      {number}
      {isSuccess ?
        <IoCheckmarkCircle className="text-sm text-green-500" />
      : <LoadingSpinner />}
    </div>
  );
};

const ErrorEntry = ({
  label,
  errors,
}: {
  label?: string;
  errors?: (string | Error)[];
}): JSX.Element => {
  if (!errors?.length) {
    return <></>;
  }

  return (
    <div className="mb-2">
      {label && <div className="text-red-500 font-medium">{label}:</div>}
      {errors.map((e) => {
        const string = e instanceof Error ? e.message : String(e);
        return (
          <div key={string} className="mt-1">
            {string}
          </div>
        );
      })}
    </div>
  );
};

const LoadingSpinner = (): JSX.Element => {
  return (
    <i
      className={clsx(
        "block w-3 h-3 border-2 mr-px",
        "border-transparent border-t-yellow rounded-[50%]",
        "animate-loadingSpinner"
      )}
    />
  );
};

// compare two block heights to be sure the first height is synced with the tip of the chain
const compareHeights = (
  height1?: number | null,
  height2?: number | null
): boolean => {
  if (!height1) return false;
  if (!height2) return true;
  return height1 >= height2;
};

const useQueryIndexerBlockHeight = (
  queryKey?: string
): UseQueryResult<number, Error> => {
  const api = useAtomValue(indexerApiAtom);
  return useQuery({
    queryKey: ["queryIndexerBlockHeight", queryKey],
    queryFn: () => fetchBlockHeightByTimestamp(api, Date.now()),
  });
};

const useQueryRpcBlockHeight = (
  queryKey?: string
): UseQueryResult<number, Error> => {
  const rpcUrl = useAtomValue(rpcUrlAtom);
  return useQuery({
    queryKey: ["queryRpcBlockHeight", queryKey],
    queryFn: () =>
      fetch(`${rpcUrl}/status`)
        .then((d) => d.json())
        .then((d) => Number(d.result.sync_info.latest_block_height)),
  });
};

export const SyncIndicator = (): JSX.Element => {
  const { dataUpdatedAt } = useAtomValue(indexerCrawlersInfoAtom);

  const indexerRequestsSyncStatus = useAtomValue(indexerRequestsSyncStatusAtom);
  const indexerServicesSyncStatus = useAtomValue(indexerServicesSyncStatusAtom);
  const chainStatus = useAtomValue(chainStatusAtom);
  const settings = useAtomValue(settingsAtom);

  // This is a trick to refetch the block height from RPC and Indexer
  // It's dispatched by any of the two scenarios
  // - If we receive an event upate from `useServerSideEvents`
  // - If we receive an update from `indexerCrawlersInfoAtom`
  const refetchQueryKey = `${chainStatus?.height}__${dataUpdatedAt}`;
  const rpcBlockHeightQuery = useQueryRpcBlockHeight(refetchQueryKey);
  const indexerBlockHeightQuery = useQueryIndexerBlockHeight(refetchQueryKey);

  // Individual atom status checks
  const myValidators = useAtomValue(myValidatorsAtom);
  const allValidators = useAtomValue(allValidatorsAtom);
  const allProposals = useAtomValue(allProposalsAtom);
  const votedProposals = useAtomValue(votedProposalsAtom);
  const shieldedProgress = useAtomValue(shieldedSyncProgress);

  const { errors } = indexerRequestsSyncStatus;
  const { services } = indexerServicesSyncStatus;

  // Check individual category status
  const isRpcHeightSuccess = compareHeights(
    rpcBlockHeightQuery.data,
    indexerBlockHeightQuery.data
  );
  const isIndexerHeightSuccess = compareHeights(
    indexerBlockHeightQuery.data,
    rpcBlockHeightQuery.data
  );
  const stakingIsSuccess = myValidators.isSuccess && allValidators.isSuccess;
  const governanceIsSuccess =
    allProposals.isSuccess && votedProposals.isSuccess;

  const isIndexerError =
    rpcBlockHeightQuery.isError ||
    indexerBlockHeightQuery.isError ||
    indexerRequestsSyncStatus.isError ||
    indexerServicesSyncStatus.isError;

  const isIndexerSyncing =
    isQuerySyncing(rpcBlockHeightQuery) ||
    isQuerySyncing(indexerBlockHeightQuery) ||
    rpcBlockHeightQuery.data !== indexerBlockHeightQuery.data ||
    indexerRequestsSyncStatus.isSyncing ||
    indexerServicesSyncStatus.isSyncing;

  const roundedProgress = Math.min(Math.floor(shieldedProgress * 100), 100);
  const isShieldedSyncing = roundedProgress < 100;

  return (
    <div className="flex items-center gap-8 px-2 py-3">
      <div className="relative group/tooltip">
        {isShieldedSyncing && (
          <PulsingRing size="small" className="absolute top-1 left-1" />
        )}
        <div
          className={twMerge(
            "w-2 h-2 rounded-full",
            "bg-green-500",
            isShieldedSyncing && "bg-yellow-500 animate-pulse"
          )}
        />
        <Tooltip position="bottom" className="z-10 w-[190px] py-3 -mb-4">
          <div className="space-y-3 w-full text-xs font-medium text-yellow">
            {isShieldedSyncing ?
              <>
                <div>Shielded sync: {roundedProgress}%</div>
                <div className="w-full bg-yellow-900 h-1">
                  <div
                    className="bg-yellow-500 h-1 transition-all duration-300"
                    style={{ width: `${roundedProgress}%` }}
                  />
                </div>
                <div className="text-sm text-white">
                  Syncing your shielded assets now. Balances will update in a
                  few seconds.
                </div>
              </>
            : <div>Shielded sync completed</div>}
          </div>
        </Tooltip>
      </div>

      <div className="relative group/tooltip">
        <div
          className={twMerge(
            "w-2 h-2 rounded-full",
            "bg-green-500",
            isIndexerSyncing && "bg-yellow-500 animate-pulse",
            isIndexerError && !isIndexerSyncing && "bg-red-500"
          )}
        />
        <Tooltip position="bottom" className="z-10 w-[210px] py-3 -mb-4">
          {isIndexerError ?
            <div className="break-words">
              <ErrorEntry label="Error" errors={errors} />
              <ErrorEntry label="Lagging services" errors={services} />
              {rpcBlockHeightQuery.error && (
                <ErrorEntry
                  label="Block height sync error"
                  errors={[rpcBlockHeightQuery.error]}
                />
              )}
              {indexerBlockHeightQuery.error && (
                <ErrorEntry
                  label="Block height sync error"
                  errors={[indexerBlockHeightQuery.error]}
                />
              )}
            </div>
          : <div className="w-full space-y-1">
              <StatusEntry
                label="RPC Height"
                number={
                  settings.advancedMode ? rpcBlockHeightQuery.data : undefined
                }
                isSuccess={isRpcHeightSuccess}
              />
              <StatusEntry
                label="Indexer Height"
                number={
                  settings.advancedMode ?
                    indexerBlockHeightQuery.data
                  : undefined
                }
                isSuccess={isIndexerHeightSuccess}
              />
              <StatusEntry label="Staking" isSuccess={stakingIsSuccess} />
              <StatusEntry label="Governance" isSuccess={governanceIsSuccess} />
            </div>
          }
        </Tooltip>
      </div>
    </div>
  );
};
