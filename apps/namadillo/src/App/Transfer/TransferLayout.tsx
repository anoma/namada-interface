import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { Outlet } from "react-router-dom";

export const TransferLayout: React.FC = () => {
  return (
    <PageWithSidebar>
      <Outlet />
      <aside className="w-full mt-2 flex flex-col sm:flex-row lg:mt-0 lg:flex-col gap-2">
        <ShieldAllBanner />
      </aside>
    </PageWithSidebar>
  );
};
