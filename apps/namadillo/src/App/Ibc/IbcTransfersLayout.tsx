import { Panel } from "@namada/components";
import { NavigationFooter } from "App/AccountOverview/NavigationFooter";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Sidebar } from "App/Layout/Sidebar";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { Outlet } from "react-router-dom";
import { LearnAboutIbc } from "./LearnAboutIbc";

export const IbcTransfersLayout = (): JSX.Element => {
  const userHasAccount = useUserHasAccount();

  if (!userHasAccount) {
    return <ConnectPanel actionText="To IBC Transfer" />;
  }

  const renderOutletContent = (): JSX.Element => (
    <Panel className="py-8 rounded-t-none h-full">
      <Outlet />
    </Panel>
  );

  return (
    <PageWithSidebar>
      <div className="flex flex-col flex-1">
        {renderOutletContent()}
        <NavigationFooter className="mt-2 flex-none h-16" />
      </div>
      <Sidebar>
        <LearnAboutIbc />
      </Sidebar>
    </PageWithSidebar>
  );
};
