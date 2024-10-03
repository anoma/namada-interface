import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { useIsAuthenticated } from "hooks/useIsAuthenticated";
import { ShieldedBalanceChart } from "./ShieldedBalanceChart";
import { ShieldedNamBalance } from "./ShieldedNamBalance";
import { ShieldedOverviewPanel } from "./ShieldedOverviewPanel";

export const MaspOverview: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className="flex flex-col gap-2">
      {!isAuthenticated && <ConnectBanner actionText="To shield assets" />}
      <div className="flex flex-col sm:grid sm:grid-cols-[2fr_3fr] gap-2">
        <Panel>
          <ShieldedBalanceChart />
        </Panel>
        <Panel>
          <ShieldedNamBalance />
        </Panel>
      </div>
      <ShieldedOverviewPanel />
    </div>
  );
};
