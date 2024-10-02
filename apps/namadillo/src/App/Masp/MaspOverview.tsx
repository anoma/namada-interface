import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { ShieldedBalanceChart } from "./ShieldedBalanceChart";
import { ShieldedNamBalance } from "./ShieldedNamBalance";
import { ShieldedOverviewPanel } from "./ShieldedOverviewPanel";

export const MaspOverview: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <ConnectBanner
        disconnectedText="To shield assets please connect your account"
        missingAccountText="To shield assets please create or import an account using Namada keychain"
      />
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
