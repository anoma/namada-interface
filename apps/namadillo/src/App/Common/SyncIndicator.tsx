import { useState } from "react";
import { twMerge } from "tailwind-merge";

enum Status {
  IDLE = "idle",
  SYNCING = "syncing",
  ERROR = "error",
}

export const SyncIndicator = (): JSX.Element => {
  const [status] = useState<Status>(Status.IDLE);

  return (
    <div className="flex items-center gap-2">
      <div
        className={twMerge(
          "w-2 h-2 rounded-full",
          status === Status.IDLE ? "bg-green-500" : undefined,
          status === Status.SYNCING ? "bg-yellow-500 animate-pulse" : undefined,
          status === Status.ERROR ? "bg-red-500" : undefined
        )}
      />
    </div>
  );
};
