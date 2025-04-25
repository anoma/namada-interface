import { Panel, TabContainer } from "@namada/components";
import { NavigationFooter } from "App/AccountOverview/NavigationFooter";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Sidebar } from "App/Layout/Sidebar";
import { routes } from "App/routes";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LearnAboutIbc } from "./LearnAboutIbc";

export const IbcTransfersLayout = (): JSX.Element => {
  const userHasAccount = useUserHasAccount();
  const location = useLocation();
  const navigate = useNavigate();

  if (!userHasAccount) {
    return <ConnectPanel actionText="To IBC Transfer" />;
  }

  const renderOutletContent = (): JSX.Element => (
    <Panel className="py-20 rounded-t-none h-full">
      <Outlet />
    </Panel>
  );

  const handleTabChange = (index: number): void => {
    const targetRoute = index === 0 ? routes.ibc : routes.ibcWithdraw;
    navigate(targetRoute);
  };

  const getActiveTabIndex = (): number =>
    location.pathname === routes.ibc ? 0 : 1;

  return (
    <PageWithSidebar>
      <div className="flex flex-col flex-1">
        <TabContainer
          id="ibc-transfer"
          title="IBC Transfer"
          containerClassname="h-full flex-1"
          activeTabIndex={getActiveTabIndex()}
          onChangeActiveTab={handleTabChange}
          tabs={[
            { title: "Deposit", children: renderOutletContent() },
            { title: "Withdraw", children: renderOutletContent() },
          ]}
        />
        <NavigationFooter className="mt-2 flex-none h-16" />
      </div>
      <Sidebar>
        <ShieldAllBanner />
        <LearnAboutIbc />
      </Sidebar>
    </PageWithSidebar>
  );
};
