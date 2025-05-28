import { ShieldedSyncProgress } from "App/Masp/ShieldedSyncProgress";
import { EpochInformation } from "App/Sidebars/EpochInformation";
import { ReactNode } from "react";

export const Sidebar = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <aside className="flex flex-col gap-2 mt-1.5 lg:mt-0">
      <EpochInformation />
      <ShieldedSyncProgress />
      {children}
    </aside>
  );
};
