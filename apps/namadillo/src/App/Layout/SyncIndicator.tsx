import { Tooltip } from "@namada/components";
import { accountBalanceAtom, transparentBalanceAtom } from "atoms/accounts";
import { indexerApiAtom } from "atoms/api";
import { shieldedBalanceAtom } from "atoms/balance";
import { fetchBlockHeightByTimestamp } from "atoms/balance/services";
import { chainStatusAtom } from "atoms/chain";
import { allProposalsAtom, votedProposalsAtom } from "atoms/proposals";
import {
  indexerHeartbeatAtom,
  maspIndexerHeartbeatAtom,
  rpcHeartbeatAtom,
} from "atoms/settings";
import {
  indexerServicesSyncStatusAtom,
  syncStatusAtom,
} from "atoms/syncStatus/atoms";
import { allValidatorsAtom, myValidatorsAtom } from "atoms/validators";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
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
  const api = useAtomValue(indexerApiAtom);
  const chainStatus = useAtomValue(chainStatusAtom);

  // Individual atom status checks
  const indexerHeartbeat = useAtomValue(indexerHeartbeatAtom);
  const maspIndexerHeartbeat = useAtomValue(maspIndexerHeartbeatAtom);
  const rpcHeartbeat = useAtomValue(rpcHeartbeatAtom);
  const shieldedBalance = useAtomValue(shieldedBalanceAtom);
  const transparentBalance = useAtomValue(transparentBalanceAtom);
  const accountBalance = useAtomValue(accountBalanceAtom);
  const myValidators = useAtomValue(myValidatorsAtom);
  const allValidators = useAtomValue(allValidatorsAtom);
  const allProposals = useAtomValue(allProposalsAtom);
  const votedProposals = useAtomValue(votedProposalsAtom);

  const [blockHeightSync, setBlockHeightSync] = useState<boolean | null>(null);
  const [indexerBlockHeight, setIndexerBlockHeight] = useState<number | null>(
    null
  );

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

  // Check individual category status
  const heartbeatStatus =
    indexerHeartbeat.isSuccess &&
    maspIndexerHeartbeat.isSuccess &&
    rpcHeartbeat.isSuccess;
  const balancesStatus =
    shieldedBalance.isSuccess &&
    transparentBalance.isSuccess &&
    accountBalance.isSuccess;
  const stakingStatus = myValidators.isSuccess && allValidators.isSuccess;
  const governanceStatus = allProposals.isSuccess && votedProposals.isSuccess;

  console.log(syncStatus, indexerServicesSyncStatus);

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
  console.log(indexerBlockHeight, chainStatus);
  return (
    <div className="flex gap-10 px-2 py-3">
      <div className="relative group/tooltip">
        <div
          className={twMerge(
            "w-2 h-2 rounded-full",
            "bg-green-500",
            isSyncing && "bg-yellow-500 animate-pulse",
            isError && !isSyncing && "bg-red-500"
          )}
        />
        <Tooltip position="bottom" className="z-10 w-max text-balance -mb-6">
          {isSyncing ?
            <div className="py-2">
              <div className="text-yellow font-medium">Syncing...</div>
              <div>
                Indexer Sync: {chainStatus?.height} / {indexerBlockHeight}
              </div>
              <div className="flex items-center gap-1">
                Heartbeat:{" "}
                {heartbeatStatus ?
                  <IoCheckmarkCircleOutline className="text-green-500" />
                : <IoCloseCircleOutline className="text-red-500" />}
              </div>
              <div className="flex items-center gap-1">
                Balances:{" "}
                {balancesStatus ?
                  <IoCheckmarkCircleOutline className="text-green-500" />
                : <IoCloseCircleOutline className="text-red-500" />}
              </div>
              <div className="flex items-center gap-1">
                Staking:{" "}
                {stakingStatus ?
                  <IoCheckmarkCircleOutline className="text-green-500" />
                : <IoCloseCircleOutline className="text-red-500" />}
              </div>
              <div className="flex items-center gap-1">
                Governance:{" "}
                {governanceStatus ?
                  <IoCheckmarkCircleOutline className="text-green-500" />
                : <IoCloseCircleOutline className="text-red-500" />}
              </div>
            </div>
          : isError ?
            <div className="max-w-xs break-words">
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
