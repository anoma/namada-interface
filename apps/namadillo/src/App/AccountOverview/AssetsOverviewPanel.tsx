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
        "mt-2 transition-colors border-solid border border-transparent",
        "duration-0",
        "[&[aria-selected='true']]:z-20 [&[aria-selected='true']]:!border-b-neutral-950",
        shieldedPanelSelected &&
          "[&[aria-selected='true']]:text-yellow [&[aria-selected='true']]:border-yellow"
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
