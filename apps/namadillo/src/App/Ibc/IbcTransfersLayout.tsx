import { Panel, TabContainer } from "@namada/components";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { routes } from "App/routes";
import { EpochInformation } from "App/Sidebars/EpochInformation";
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
      <aside className="w-full mt-2 flex flex-col sm:flex-row lg:mt-0 lg:flex-col gap-2">
        <EpochInformation />
        <ShieldAllBanner />
      </aside>
    </PageWithSidebar>
  );
};
