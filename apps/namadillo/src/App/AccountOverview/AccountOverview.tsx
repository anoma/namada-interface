import { ConnectPanel } from "App/Common/ConnectPanel";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { AssetsOverviewPanel } from "./AssetsOverviewPanel";
import { TotalBalanceBanner } from "./TotalBalanceBanner";

export const AccountOverview = (): JSX.Element => {
  const userHasAccount = useUserHasAccount();

  if (!userHasAccount) {
    return (
      <ConnectPanel>
        <div className="mb-6">Your Gateway to the Shielded Multichain</div>
      </ConnectPanel>
    );
  }

  return (
    <>
      <TotalBalanceBanner />
      <AssetsOverviewPanel />
    </>
  );
};
