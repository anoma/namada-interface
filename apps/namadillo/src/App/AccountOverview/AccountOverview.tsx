import { Stack } from "@namada/components";
import { useUntilIntegrationAttached } from "@namada/integrations";
import { Intro } from "App/Common/Intro";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import MainnetRoadmap from "App/Sidebars/MainnetRoadmap";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { chainAtom } from "slices/chain";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { AccountBalanceContainer } from "./AccountBalanceContainer";
import { NavigationFooter } from "./NavigationFooter";

export const AccountOverview = (): JSX.Element => {
  const chain = useAtomValue(chainAtom);
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const fullWidthClassName = clsx({ "col-span-2": !isConnected });

  // TODO: we need a better way to verify if extension is connected
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const hasExtensionInstalled =
    currentExtensionAttachStatus === "attached" ||
    currentExtensionAttachStatus === "pending";

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
            <Intro
              chain={chain}
              hasExtensionInstalled={hasExtensionInstalled}
            />
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
