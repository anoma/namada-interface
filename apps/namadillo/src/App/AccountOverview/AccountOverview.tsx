import { Stack } from "@namada/components";
import { Intro } from "App/Common/Intro";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import MainnetRoadmap from "App/Sidebars/MainnetRoadmap";
import {
  applicationFeaturesAtom,
  namadaExtensionConnectedAtom,
} from "atoms/settings";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { AccountBalanceContainer } from "./AccountBalanceContainer";
import { NamBalanceContainer } from "./NamBalanceContainer";
import { NavigationFooter } from "./NavigationFooter";

export const AccountOverview = (): JSX.Element => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const { claimRewardsEnabled, maspEnabled } = useAtomValue(
    applicationFeaturesAtom
  );

  const fullView = claimRewardsEnabled || maspEnabled;
  const fullWidthClassName = clsx({ "col-span-2": !isConnected });

  return (
    <PageWithSidebar>
      <div className={clsx("flex w-full", fullWidthClassName)}>
        {!isConnected && (
          <section className="flex rounded-sm items-center w-full bg-black">
            <div className="w-[420px] mx-auto">
              <Intro />
            </div>
          </section>
        )}

        {isConnected && !fullView && (
          <section className="flex items-center bg-black rounded-sm w-full">
            <Stack gap={5} className="my-auto min-w-[365px] mx-auto py-12">
              <AccountBalanceContainer />
              <NavigationFooter />
            </Stack>
          </section>
        )}

        {isConnected && fullView && (
          <section className="flex flex-col w-full rounded-sm min-h-full gap-2">
            <div className="grid grid-cols-[1.25fr_1fr] gap-2">
              <div className="bg-black rounded-sm">
                <NamBalanceContainer />
              </div>
              <div className="flex gap-2 bg-black rounded-sm"></div>
            </div>
            <div className="flex items-center bg-black rounded-sm flex-1 justify-center">
              <NavigationFooter />
            </div>
          </section>
        )}
      </div>
      {isConnected && (
        <aside className="bg-black rounded-sm">
          <MainnetRoadmap />
        </aside>
      )}
    </PageWithSidebar>
  );
};
