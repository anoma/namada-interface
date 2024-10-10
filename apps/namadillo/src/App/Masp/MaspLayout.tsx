import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { routes } from "App/routes";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { useIsAuthenticated } from "hooks/useIsAuthenticated";
import { Outlet, useLocation } from "react-router-dom";

export const MaspLayout: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated && location.pathname !== routes.masp) {
    return <ConnectPanel actionText="To shield assets" />;
  }

  return (
    <PageWithSidebar>
      <Outlet />
      <aside className="w-full mt-2 flex flex-col sm:flex-row lg:mt-0 lg:flex-col gap-2">
        <ShieldAllBanner />
      </aside>
    </PageWithSidebar>
  );
};
