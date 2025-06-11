import { NavigationFooter } from "App/AccountOverview/NavigationFooter";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Sidebar } from "App/Layout/Sidebar";
import { MaspAssetRewards } from "App/Sidebars/MaspAssetRewards";
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
        <div className="flex relative flex-col flex-1">
          <Outlet />
        </div>
        <NavigationFooter className="mt-2 flex-none h-16" />
      </div>
      <Sidebar>
        {features.shieldingRewardsEnabled && <MaspAssetRewards />}
        <LearnAboutMasp />
      </Sidebar>
    </PageWithSidebar>
  );
};
