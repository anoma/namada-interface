import { NavigationFooter } from "App/AccountOverview/NavigationFooter";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Sidebar } from "App/Layout/Sidebar";
import { LearnAboutTransfer } from "App/NamadaTransfer/LearnAboutTransfer";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { Outlet } from "react-router-dom";

export const TransferLayout: React.FC = () => {
  const userHasAccount = useUserHasAccount();

  if (!userHasAccount) {
    return <ConnectPanel actionText="To transfer assets" />;
  }

  return (
    <PageWithSidebar>
      <div className="flex flex-col min-h-full">
        <div className="flex-grow">
          <Outlet />
        </div>
        <NavigationFooter className="mt-2" />
      </div>
      <Sidebar>
        <ShieldAllBanner />
        <LearnAboutTransfer />
      </Sidebar>
    </PageWithSidebar>
  );
};
