import { Panel, Stack } from "@namada/components";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import MainnetRoadmap from "App/Sidebars/MainnetRoadmap";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { StakingRewardsPanel } from "App/Staking/StakingRewardsPanel";
import { applicationFeaturesAtom } from "atoms/settings";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";
import { AccountBalanceContainer } from "./AccountBalanceContainer";
import { NamBalanceContainer } from "./NamBalanceContainer";
import { NavigationFooter } from "./NavigationFooter";

export const AccountOverview = (): JSX.Element => {
  const userHasAccount = useUserHasAccount();
  const { claimRewardsEnabled } = useAtomValue(applicationFeaturesAtom);

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
        {claimRewardsEnabled ?
          <section className="flex flex-col w-full rounded-sm min-h-full gap-2">
            <div className="grid grid-cols-[1.25fr_1fr] gap-2">
              <Panel className="pl-4 pr-6 py-5">
                <NamBalanceContainer />
              </Panel>
              <Panel>
                <StakingRewardsPanel />
              </Panel>
            </div>
            <Panel className="flex items-center flex-1 justify-center">
              <NavigationFooter />
            </Panel>
          </section>
        : <section className="flex items-center bg-black rounded-sm w-full">
            <Stack gap={5} className="my-auto min-w-[365px] mx-auto py-12">
              <AccountBalanceContainer />
              <NavigationFooter />
            </Stack>
          </section>
        }
      </div>

      <aside className="flex flex-col gap-2">
        <ShieldAllBanner />
        <MainnetRoadmap />
      </aside>
    </PageWithSidebar>
  );
};
