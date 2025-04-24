import { lastCompletedShieldedSyncAtom, viewingKeysAtom } from "atoms/balance";
import { useRequiresNewShieldedSync } from "hooks/useRequiresNewShieldedSync";
import { useAtomValue } from "jotai";
import { MaspSyncCover } from "./MaspSyncCover";

type MaspContainerProps = React.PropsWithChildren;

export const MaspContainer = ({
  children,
}: MaspContainerProps): JSX.Element => {
  const requiresNewSync = useRequiresNewShieldedSync();
  const lastSync = useAtomValue(lastCompletedShieldedSyncAtom);
  const viewingKeys = useAtomValue(viewingKeysAtom);
  const hasViewingKey = viewingKeys.isSuccess && viewingKeys.data[0];

  return (
    <div className="flex flex-col flex-1">
      {children}
      {requiresNewSync && hasViewingKey && (
        <MaspSyncCover longSync={lastSync === undefined} />
      )}
    </div>
  );
};
