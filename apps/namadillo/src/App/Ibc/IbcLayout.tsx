import { ConnectPanel } from "App/Common/ConnectPanel";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { Outlet } from "react-router-dom";

export const IbcLayout: React.FC = () => {
  const userHasAccount = useUserHasAccount();

  if (!userHasAccount) {
    return <ConnectPanel actionText="To IBC Transfer" />;
  }

  return (
    <PageWithSidebar>
      <Outlet />
    </PageWithSidebar>
  );
};
