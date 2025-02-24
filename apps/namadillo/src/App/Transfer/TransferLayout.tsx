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
      <Outlet />
      <Sidebar>
        <ShieldAllBanner />
        <LearnAboutTransfer />
      </Sidebar>
    </PageWithSidebar>
  );
};
