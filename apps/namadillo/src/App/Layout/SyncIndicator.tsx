import { Tooltip } from "@namada/components";
import { PulsingRing } from "App/Common/PulsingRing";
import { indexerApiAtom } from "atoms/api";
import { shieldedSyncProgress } from "atoms/balance";
import { chainStatusAtom } from "atoms/chain";
import { fetchBlockHeightByTimestamp } from "atoms/chain/services";
import { allProposalsAtom, votedProposalsAtom } from "atoms/proposals";
import { settingsAtom } from "atoms/settings";
import {
  indexerServicesSyncStatusAtom,
  syncStatusAtom,
} from "atoms/syncStatus/atoms";
import { allValidatorsAtom, myValidatorsAtom } from "atoms/validators";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
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
      {label && (
        <div
          className={
            label === "Error" ? "text-red-500 font-medium" : "font-medium"
          }
        >
          {label}:
        </div>
      )}
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

export const SyncIndicator = (): JSX.Element => {
  const syncStatus = useAtomValue(syncStatusAtom);
  const indexerServicesSyncStatus = useAtomValue(indexerServicesSyncStatusAtom);
  const api = useAtomValue(indexerApiAtom);
  const chainStatus = useAtomValue(chainStatusAtom);

  // Individual atom status checks
  const myValidators = useAtomValue(myValidatorsAtom);
  const allValidators = useAtomValue(allValidatorsAtom);
  const allProposals = useAtomValue(allProposalsAtom);
  const votedProposals = useAtomValue(votedProposalsAtom);
  const shieldedProgress = useAtomValue(shieldedSyncProgress);
  const settings = useAtomValue(settingsAtom);

  const [blockHeightSynced, setBlockHeightSynced] = useState<boolean | null>(
    null
  );
  const [indexerBlockHeight, setIndexerBlockHeight] = useState<number | null>(
    null
  );

  const { errors } = syncStatus;
  const { services } = indexerServicesSyncStatus;

  const isChainStatusError =
    !chainStatus?.height || !chainStatus?.epoch || !blockHeightSynced;
  const isIndexerError =
    syncStatus.isError ||
    indexerServicesSyncStatus.isError ||
    isChainStatusError;
  const isIndexerSyncing =
    syncStatus.isSyncing ||
    indexerServicesSyncStatus.isSyncing ||
    !blockHeightSynced;

  // Check individual category status
  const stakingIsSuccess = myValidators.isSuccess && allValidators.isSuccess;
  const governanceIsSuccess =
    allProposals.isSuccess && votedProposals.isSuccess;

  const roundedProgress = Math.min(Math.floor(shieldedProgress * 100), 100);
  const isShieldedSyncing = roundedProgress < 100;

  useEffect(() => {
    (async () => {
      const indexerBlockHeight = await fetchBlockHeightByTimestamp(
        api,
        Date.now()
      );
      setIndexerBlockHeight(indexerBlockHeight);
      setBlockHeightSynced(indexerBlockHeight === chainStatus?.height);
    })();
  }, [chainStatus?.height]);

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
          <div className="space-y-3 w-full">
            <div className="text-xs font-medium text-yellow">
              Shielded sync: {roundedProgress}%
            </div>
            {isShieldedSyncing && (
              <>
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
            )}
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
              <ErrorEntry label="Chain status not loaded." />
            </div>
          : <div className="w-full space-y-1">
              <StatusEntry
                label="RPC Height"
                number={settings.advancedMode ? chainStatus?.height : undefined}
                isSuccess={!!chainStatus?.height}
              />
              <StatusEntry
                label="Indexer Height"
                number={settings.advancedMode ? indexerBlockHeight : undefined}
                isSuccess={!!blockHeightSynced}
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
