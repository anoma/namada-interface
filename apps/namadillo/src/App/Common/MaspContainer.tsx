import { lastCompletedShieldedSyncAtom } from "atoms/balance";
import { useRequiresNewShieldedSync } from "hooks/useRequiresNewShieldedSync";
import { useAtomValue } from "jotai";
import { MaspSyncCover } from "./MaspSyncCover";

type MaspContainerProps = React.PropsWithChildren;

export const MaspContainer = ({
  children,
}: MaspContainerProps): JSX.Element => {
  const requiresNewSync = useRequiresNewShieldedSync();
  const lastSync = useAtomValue(lastCompletedShieldedSyncAtom);
  return (
    <div className="relative">
      {children}
      {requiresNewSync && <MaspSyncCover longSync={lastSync === undefined} />}
    </div>
  );
};
