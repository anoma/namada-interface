import { TabContainer } from "@namada/components";
import clsx from "clsx";
import { useRequiresNewShieldedSync } from "hooks/useRequiresNewShieldedSync";
import { useState } from "react";
import { ShieldedAssetsOverview } from "./ShieldedAssetsOverview";
import { UnshieldedAssetsOverview } from "./UnshieldedAssetsOverview";

export const AssetsOverviewPanel = (): JSX.Element => {
  const requiresNewShieldedSync = useRequiresNewShieldedSync();

  // Always select the unshielded tab as default if shielded sync is required
  const [currentTab, setCurrentTab] = useState(requiresNewShieldedSync ? 1 : 0);
  const shieldedPanelSelected = currentTab === 0;

  return (
    <TabContainer
      id="ibc-transfer"
      title="IBC Transfer"
      activeTabIndex={currentTab}
      onChangeActiveTab={setCurrentTab}
      containerClassname="flex-1"
      className={clsx(
        "mt-2 transition-colors border-solid border border-transparent border-b-neutral-950",
        "duration-0",
        shieldedPanelSelected && "[&[aria-selected='false']]:border-b-yellow",
        shieldedPanelSelected &&
          "[&[aria-selected='true']]:text-yellow [&[aria-selected='true']]:border-x-yellow [&[aria-selected='true']]:border-t-yellow"
      )}
      tabs={[
        {
          title: "Shielded Assets (MASP)",
          children: <ShieldedAssetsOverview />,
        },
        { title: "Unshielded Assets", children: <UnshieldedAssetsOverview /> },
      ]}
    />
  );
};
