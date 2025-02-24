import { ConnectPanel } from "App/Common/ConnectPanel";
import { MaspContainer } from "App/Common/MaspContainer";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { Sidebar } from "App/Layout/Sidebar";
import { ShieldAllBanner } from "App/Sidebars/ShieldAllBanner";
import { shieldedBalanceAtom } from "atoms/balance";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { LearnAboutMasp } from "./LearnAboutMasp";

export const MaspLayout: React.FC = () => {
  const userHasAccount = useUserHasAccount();

  const { refetch: refetchShieldedBalance } = useAtomValue(shieldedBalanceAtom);

  useEffect(() => {
    refetchShieldedBalance();
  }, []);

  if (!userHasAccount) {
    return <ConnectPanel actionText="To shield assets" />;
  }

  return (
    <PageWithSidebar>
      <MaspContainer>
        <Outlet />
      </MaspContainer>
      <Sidebar>
        <ShieldAllBanner />
        <LearnAboutMasp />
      </Sidebar>
    </PageWithSidebar>
  );
};
