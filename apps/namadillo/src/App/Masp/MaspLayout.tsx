import { NavigationFooter } from "App/AccountOverview/NavigationFooter";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { MaspContainer } from "App/Common/MaspContainer";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Sidebar } from "App/Layout/Sidebar";
import { MaspAssetRewards } from "App/Sidebars/MaspAssetRewards";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { shieldedBalanceAtom } from "atoms/balance";
import { applicationFeaturesAtom } from "atoms/settings";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { LearnAboutMasp } from "./LearnAboutMasp";

export const MaspLayout: React.FC = () => {
  const userHasAccount = useUserHasAccount();
  const features = useAtomValue(applicationFeaturesAtom);

  const { refetch: refetchShieldedBalance } = useAtomValue(shieldedBalanceAtom);

  useEffect(() => {
    refetchShieldedBalance();
  }, []);

  if (!userHasAccount) {
    return <ConnectPanel actionText="To shield assets" />;
  }

  return (
    <PageWithSidebar>
      <div className="flex flex-col flex-1">
        <MaspContainer>
          <Outlet />
        </MaspContainer>
        <NavigationFooter className="mt-2 flex-none h-16" />
      </div>
      <Sidebar>
        {features.shieldingRewardsEnabled && <MaspAssetRewards />}
        <ShieldAllBanner />
        <LearnAboutMasp />
      </Sidebar>
    </PageWithSidebar>
  );
};
