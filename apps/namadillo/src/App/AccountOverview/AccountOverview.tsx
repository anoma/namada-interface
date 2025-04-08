import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Sidebar } from "App/Layout/Sidebar";
import { JoinDiscord } from "App/Sidebars/JoinDiscord";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { twMerge } from "tailwind-merge";
import { AssetsOverviewPanel } from "./AssetsOverviewPanel";
import { NavigationFooter } from "./NavigationFooter";
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
      <div className={twMerge("flex w-full")}>
        <section className="flex flex-col w-full rounded-sm min-h-full gap-2">
          <TotalBalanceBanner />
          <AssetsOverviewPanel />
          <div>
            <NavigationFooter />
          </div>
        </section>
      </div>
      <Sidebar>
        <StakeSidebar />
        <ShieldAllBanner />
        <JoinDiscord />
      </Sidebar>
    </PageWithSidebar>
  );
};
