import { Stack } from "@namada/components";
import { Intro } from "App/Common/Intro";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import MainnetRoadmap from "App/Sidebars/MainnetRoadmap";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { AccountBalanceContainer } from "./AccountBalanceContainer";
import { NavigationFooter } from "./NavigationFooter";

export const AccountOverview = (): JSX.Element => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const fullWidthClassName = clsx({ "col-span-2": !isConnected });
  return (
    <PageWithSidebar>
      <div
        className={clsx(
          "flex items-center bg-black rounded-sm w-full",
          fullWidthClassName
        )}
      >
        {!isConnected && (
          <div className="w-[420px] mx-auto">
            <Intro />
          </div>
        )}
        {isConnected && (
          <Stack gap={5} className="my-auto min-w-[365px] mx-auto py-12">
            <AccountBalanceContainer />
            <NavigationFooter />
          </Stack>
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
