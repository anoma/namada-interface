import { Panel } from "@namada/components";
import { ConnectPanel } from "App/Common/ConnectPanel";

export const IbcShieldAll: React.FC = () => {
  return (
    <ConnectPanel
      disconnectedText="To shield all assets please connect your account"
      missingAccountText="To shield all assets please create or import an account using Namada keychain"
    >
      <Panel>
        <div className="text-yellow">IBC: ShieldAll (WIP)</div>
      </Panel>
    </ConnectPanel>
  );
};
