import { Panel, TabContainer } from "@namada/components";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Sidebar } from "App/Layout/Sidebar";
import { routes } from "App/routes";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export const IbcTransfersLayout = (): JSX.Element => {
  const userHasAccount = useUserHasAccount();
  const location = useLocation();
  const navigate = useNavigate();

  if (!userHasAccount) {
    return <ConnectPanel actionText="To IBC Transfer" />;
  }

  const renderOutletContent = (): JSX.Element => (
    <Panel className="pt-8 pb-20">
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
      <div>
        <TabContainer
          id="ibc-transfer"
          title="IBC Transfer"
          activeTabIndex={getActiveTabIndex()}
          onChangeActiveTab={handleTabChange}
          tabs={[
            { title: "To Namada", children: renderOutletContent() },
            { title: "From Namada", children: renderOutletContent() },
          ]}
        />
      </div>
      <Sidebar>
        <ShieldAllBanner />
      </Sidebar>
    </PageWithSidebar>
  );
};
