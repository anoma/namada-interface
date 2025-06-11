import { IndexerSyncIndicator } from "./IndexerSyncIndicator";
import { MaspSyncIndicator } from "./MaspSyncIndicator";

export const SyncIndicator = (): JSX.Element => {
  return (
    <div className="flex items-center gap-8 px-2 py-3">
      <MaspSyncIndicator
        syncingChildren={
          <div className="text-sm text-white">
            Syncing your shielded assets now. Balances will update in a few
            seconds.
          </div>
        }
        syncedChildren={<div>Shielded sync completed</div>}
      />
      <IndexerSyncIndicator />
    </div>
  );
};
