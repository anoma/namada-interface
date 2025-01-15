import { shieldedBalanceAtom, shieldedSyncProgress } from "atoms/balance/atoms";
import { useAtomValue } from "jotai";

export const ShieldedSyncProgress = (): JSX.Element => {
  const syncProgress = useAtomValue(shieldedSyncProgress);
  const { isFetching } = useAtomValue(shieldedBalanceAtom);

  if (!isFetching) {
    return <></>;
  }

  return (
    <div className={"bg-yellow rounded-sm text-xs font-medium py-2 px-3"}>
      Shielded sync{" "}
      {syncProgress === 1 ?
        "converting..."
      : `progress: ${Math.min(Math.floor(syncProgress * 100), 100)}%`}
    </div>
  );
};
