import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { routes } from "App/routes";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";

const GateComponent = ({ children }: { children: ReactNode }): JSX.Element => {
  const location = useLocation();

  if (location.pathname === routes.masp) {
    return <>{children}</>;
  }

  return (
    <ConnectPanel
      disconnectedText="To shield assets please connect your account"
      missingAccountText="To shield assets please create or import an account using Namada keychain"
    >
      {children}
    </ConnectPanel>
  );
};

export const MaspLayout: React.FC = () => {
  return (
    <GateComponent>
      <PageWithSidebar>
        <Outlet />
        <aside className="w-full mt-2 flex flex-col sm:flex-row lg:mt-0 lg:flex-col gap-2">
          <ShieldAllBanner />
        </aside>
      </PageWithSidebar>
    </GateComponent>
  );
};
