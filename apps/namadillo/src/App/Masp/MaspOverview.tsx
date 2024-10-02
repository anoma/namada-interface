import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import { useUserHasAccount } from "hooks/useUserHasAccount";
import { useAtomValue } from "jotai";
import { ShieldedBalanceChart } from "./ShieldedBalanceChart";
import { ShieldedNamBalance } from "./ShieldedNamBalance";
import { ShieldedOverviewPanel } from "./ShieldedOverviewPanel";

export const MaspOverview: React.FC = () => {
  const hasAccount = useUserHasAccount();
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);

  return (
    <div className="flex flex-col gap-2">
      {!isConnected && (
        <ConnectBanner text="To shield assets please connect your account" />
      )}
      {isConnected && hasAccount === false && (
        <ConnectBanner text="To shield assets please create or import an account using Namada keychain" />
      )}
      {isConnected && hasAccount && (
        <div className="flex flex-col sm:grid sm:grid-cols-[2fr_3fr] gap-2">
          <Panel>
            <ShieldedBalanceChart />
          </Panel>
          <Panel>
            <ShieldedNamBalance />
          </Panel>
        </div>
      )}
      <Panel
        className="relative pb-6 border border-yellow"
        title="Shielded Overview"
      >
        <ShieldedOverviewPanel />
      </Panel>
    </div>
  );
};
