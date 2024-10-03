import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { Outlet } from "react-router-dom";

export const TransferLayout: React.FC = () => {
  return (
    <ConnectPanel
      disconnectedText="To transfer assets please connect your account"
      missingAccountText="To transfer please create or import an account using Namada keychain"
    >
      <PageWithSidebar>
        <Outlet />
        <aside className="w-full mt-2 flex flex-col sm:flex-row lg:mt-0 lg:flex-col gap-2">
          <ShieldAllBanner />
        </aside>
      </PageWithSidebar>
    </ConnectPanel>
  );
};
