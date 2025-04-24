import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Sidebar } from "App/Layout/Sidebar";
import { JoinDiscord } from "App/Sidebars/JoinDiscord";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { AssetsOverviewPanel } from "./AssetsOverviewPanel";
import { StakeSidebar } from "./StakeSidebar";
import { TotalBalanceBanner } from "./TotalBalanceBanner";

export const AccountOverview = (): JSX.Element => {
  const userHasAccount = useUserHasAccount();
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
        <StakeSidebar />
        <ShieldAllBanner />
        <JoinDiscord />
      </Sidebar>
    </PageWithSidebar>
  );
};
