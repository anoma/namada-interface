import { Panel } from "@namada/components";
import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { LogoFooter } from "App/Layout/LogoFooter";
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
        <Panel className="flex items-center flex-1 justify-center mt-2">
          <LogoFooter />
        </Panel>
      </div>
      <Sidebar>
        <ShieldAllBanner />
        <LearnAboutTransfer />
      </Sidebar>
    </PageWithSidebar>
  );
};
