import { Panel } from "@namada/components";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { ShieldedSyncProgress } from "App/Masp/ShieldedSyncProgress";
import { EpochInformation } from "App/Sidebars/EpochInformation";
import MainnetRoadmap from "App/Sidebars/MainnetRoadmap";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { StakingRewardsPanel } from "App/Staking/StakingRewardsPanel";
import { applicationFeaturesAtom } from "atoms/settings";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";
import { BalanceOverviewChart } from "./BalanceOverviewChart";
import { MaspBanner } from "./MaspBanner";
import { NamBalanceContainer } from "./NamBalanceContainer";
import { NavigationFooter } from "./NavigationFooter";
import { TransparentOverviewPanel } from "./TransparentOverviewPanel";

export const AccountOverview = (): JSX.Element => {
  const userHasAccount = useUserHasAccount();
  const { maspEnabled } = useAtomValue(applicationFeaturesAtom);

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
          <div className="grid sm:grid-cols-[0.8fr_1.25fr_0.66fr] gap-2">
            <Panel>
              <BalanceOverviewChart />
            </Panel>
            <Panel>
              <NamBalanceContainer />
            </Panel>
            <Panel>
              <StakingRewardsPanel />
            </Panel>
          </div>
          {maspEnabled && (
            <>
              <MaspBanner />
              <TransparentOverviewPanel />
            </>
          )}
          <Panel className="flex items-center flex-1 justify-center">
            <NavigationFooter />
          </Panel>
        </section>
      </div>
      <aside className="flex flex-col gap-2">
        <EpochInformation />
        <ShieldedSyncProgress />
        <ShieldAllBanner />
        <MainnetRoadmap />
      </aside>
    </PageWithSidebar>
  );
};
