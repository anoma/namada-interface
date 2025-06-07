import { Tooltip } from "@namada/components";
import { PulsingRing } from "App/Common/PulsingRing";
import { shieldedSyncProgress } from "atoms/balance";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";

type MaspSyncIndicatorProps = {
  syncingChildren?: React.ReactNode;
  syncedChildren?: React.ReactNode;
  pulsingRingSize?: string;
  ringClassName?: string;
};

export const MaspSyncIndicator = ({
  syncingChildren,
  syncedChildren,
  pulsingRingSize = "10px",
  ringClassName = "",
}: MaspSyncIndicatorProps): JSX.Element => {
  const shieldedProgress = useAtomValue(shieldedSyncProgress);
  const roundedProgress = Math.min(Math.floor(shieldedProgress * 100), 100);
  const isShieldedSyncing = roundedProgress < 100;

  return (
    <div className="relative group/tooltip">
      {isShieldedSyncing && (
        <PulsingRing
          style={{ fontSize: pulsingRingSize }}
          ringClassName={ringClassName}
          className={clsx(
            "absolute top-1 left-1 [&_span:last-child]:!opacity-0"
          )}
        />
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
              {syncingChildren}
            </>
          : syncedChildren}
        </div>
      </Tooltip>
    </div>
  );
};
