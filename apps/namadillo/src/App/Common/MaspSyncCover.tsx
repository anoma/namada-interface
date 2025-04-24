import clsx from "clsx";
import { PulsingRing } from "./PulsingRing";

type MaspSyncCoverProps = {
  longSync?: boolean;
};

export const MaspSyncCover = ({
  longSync,
}: MaspSyncCoverProps): JSX.Element => {
  return (
    <div
      className={clsx(
        "absolute w-full h-full backdrop-blur-sm left-0 top-0 z-20 rounded-sm overflow-hidden",
        "bg-black/70"
      )}
    >
      <div
        className={clsx(
          "text-yellow text-center w-full",
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <header className="flex w-full items-center justify-center mb-4 h-42">
          <PulsingRing className="text-5xl" />
          <h2 className="absolute text-3xl font-medium text">
            Shielded Sync in Progress
          </h2>
        </header>
        <div className="relative z-40">
          <div>
            <p>
              {longSync && (
                <>
                  Shielded sync can take a few minutes. <br />
                </>
              )}
              Please wait to perform shielded actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
