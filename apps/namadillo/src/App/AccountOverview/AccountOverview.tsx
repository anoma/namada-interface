import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Sidebar } from "App/Layout/Sidebar";
import { JoinDiscord } from "App/Sidebars/JoinDiscord";
import { MaspAssetRewards } from "App/Sidebars/MaspAssetRewards";
import { MaspRewardCalculator } from "App/Sidebars/MaspRewardCalculator";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { applicationFeaturesAtom } from "atoms/settings";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { useAtomValue } from "jotai";
import { AssetsOverviewPanel } from "./AssetsOverviewPanel";
import { TotalBalanceBanner } from "./TotalBalanceBanner";

export const AccountOverview = (): JSX.Element => {
  const userHasAccount = useUserHasAccount();
  const features = useAtomValue(applicationFeaturesAtom);

  if (!userHasAccount) {
    return (
      <ConnectPanel>
        <div className="mb-6">Your Gateway to the Shielded Multichain</div>
      </ConnectPanel>
    );
  }

  return (
    <PageWithSidebar>
      <div className="flex flex-col">
        <TotalBalanceBanner />
        <AssetsOverviewPanel />
      </div>
      <Sidebar>
        {features.shieldingRewardsEnabled && <MaspAssetRewards />}
        {features.shieldingRewardsEnabled && <MaspRewardCalculator />}
        <ShieldAllBanner />
        <JoinDiscord />
      </Sidebar>
    </PageWithSidebar>
  );
};
